/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AwsService,
  DynamoDBService,
  buildDynamoDbKey,
  ListUsersForRoleRequest,
  PaginatedResponse,
  QueryParams,
  addPaginationToken
} from '@aws/workbench-core-base';
import { DeliveryMediumType } from '@aws-sdk/client-cognito-identity-provider';
import { BatchWriteItemCommandOutput } from '@aws-sdk/client-dynamodb';
import _ from 'lodash';
import { IdpUnavailableError } from '../errors/idpUnavailableError';
import { InvalidParameterError } from '../errors/invalidParameterError';
import { PluginConfigurationError } from '../errors/pluginConfigurationError';
import { RoleAlreadyExistsError } from '../errors/roleAlreadyExistsError';
import { RoleNotFoundError } from '../errors/roleNotFoundError';
import { TooManyRequestsError } from '../errors/tooManyRequestsError';
import { UserAlreadyExistsError } from '../errors/userAlreadyExistsError';
import { UserNotFoundError } from '../errors/userNotFoundError';
import { UserRolesExceedLimitError } from '../errors/userRolesExceedLimitError';
import { CreateUser, Status, User } from '../user';
import { UserManagementPlugin } from '../userManagementPlugin';
import { ListUsersRequest } from '../users/listUsersRequest';
import { ListUsersResponse } from '../users/listUsersResponse';
import {
  AccessType,
  TempRoleAccessEntry,
  TempRoleAccessEntryParser,
  TempRoleAccessItemParser
} from './tempRoleAccessEntry';

/**
 * A CognitoUserManagementPlugin instance that interfaces with Cognito to provide user management services.
 */
export class CognitoUserManagementPlugin implements UserManagementPlugin {
  // default 15 minutes time to live for each temp access/revoke set in seconds
  private readonly _defaultTempRoleAccesssTTL: number = 15 * 60;
  private readonly _tempRoleAccessEntryPrefix: string = 'TempRoleAccess';

  private _userPoolId: string;
  private _aws: AwsService;
  private _tempRoleAccessSettings?: { ddbService: DynamoDBService; ttl?: number };
  public readonly userRoleLimit: number = 100;

  /**
   *
   * @param userPoolId - the user pool id to update with the plugin
   * @param aws - a {@link AwsService} instance with permissions to perform Cognito actions
   */
  public constructor(
    userPoolId: string,
    aws: AwsService,
    tempRoleAccessSettings?: { ddbService: DynamoDBService; ttl?: number }
  ) {
    this._userPoolId = userPoolId;
    this._aws = aws;
    this._tempRoleAccessSettings = tempRoleAccessSettings;
  }

  /**
   * Gets the details for a certain user.
   *
   * @param id - the user id to get details for
   * @returns a {@link User} object containing the user's details
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to get user info
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesnt exist in the user pool
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   */
  public async getUser(id: string): Promise<User> {
    try {
      const { UserAttributes: userAttributes, Enabled: enabled } =
        await this._aws.clients.cognito.adminGetUser({
          UserPoolId: this._userPoolId,
          Username: id
        });

      const roles = await this.getUserRoles(id);

      return {
        id,
        firstName: userAttributes?.find((attr) => attr.Name === 'given_name')?.Value ?? '',
        lastName: userAttributes?.find((attr) => attr.Name === 'family_name')?.Value ?? '',
        email: userAttributes?.find((attr) => attr.Name === 'email')?.Value ?? '',
        status: enabled ? Status.ACTIVE : Status.INACTIVE,
        roles
      };
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (
        error.name === 'AccessDeniedException' ||
        error.name === 'NotAuthorizedException' ||
        error.name === 'ResourceNotFoundException'
      ) {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Gets the roles for a certain user.
   *
   * @param id - the user id to get roles for
   * @returns an array of the user's roles
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to get user info
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesnt exist in the user pool
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   */
  public async getUserRoles(id: string): Promise<string[]> {
    try {
      const groups = await this._aws.helpers.cognito.getUserGroups(this._userPoolId, id);

      if (!groups) {
        return [];
      }

      return groups.map((group) => group.GroupName ?? '').filter((group) => group);
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (
        error.name === 'AccessDeniedException' ||
        error.name === 'NotAuthorizedException' ||
        error.name === 'ResourceNotFoundException'
      ) {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Creates a new user with the given details. Roles need to be added with `addUserToRole()`.
   *
   * @param user - the user to create
   * @returns the created {@link User}
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to add a user to a user pool
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserAlreadyExistsError} if the email provided is already in use in the user pool
   * @throws {@link InvalidParameterError} if the email parameter is not in a valid format
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   */
  public async createUser(user: CreateUser): Promise<User> {
    try {
      const { User: createdUser } = await this._aws.clients.cognito.adminCreateUser({
        UserPoolId: this._userPoolId,
        Username: user.email,
        UserAttributes: [
          {
            Name: 'given_name',
            Value: user.firstName
          },
          {
            Name: 'family_name',
            Value: user.lastName
          },
          {
            Name: 'email',
            Value: user.email
          },
          {
            Name: 'email_verified',
            Value: 'true'
          }
        ],
        DesiredDeliveryMediums: [DeliveryMediumType.EMAIL]
      });

      // if the above call is successful all of the below values will be set
      return {
        id: createdUser!.Username!,
        firstName: createdUser!.Attributes!.find((attr) => attr.Name === 'given_name')!.Value!,
        lastName: createdUser!.Attributes!.find((attr) => attr.Name === 'family_name')!.Value!,
        email: createdUser!.Attributes!.find((attr) => attr.Name === 'email')!.Value!,
        status: Status.ACTIVE,
        roles: []
      };
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (
        error.name === 'AccessDeniedException' ||
        error.name === 'NotAuthorizedException' ||
        error.name === 'ResourceNotFoundException'
      ) {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'UsernameExistsException') {
        throw new UserAlreadyExistsError(error.message);
      }
      if (error.name === 'InvalidParameterException') {
        throw new InvalidParameterError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Updates a user with new details. Roles and id will not be updated.
   *
   * @param id - the id of the user to update
   * @param user - the information to update
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to update user info
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesnt exist in the user pool
   * @throws {@link InvalidParameterError} if the email parameter is not in a valid format
   * @throws {@link InvalidParameterError} if the email parameter is already in use by a different account
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   */
  public async updateUser(id: string, user: User): Promise<void> {
    try {
      await this._aws.clients.cognito.adminUpdateUserAttributes({
        UserPoolId: this._userPoolId,
        Username: id,
        UserAttributes: [
          {
            Name: 'given_name',
            Value: user.firstName
          },
          {
            Name: 'family_name',
            Value: user.lastName
          },
          {
            Name: 'email',
            Value: user.email
          }
        ]
      });
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (
        error.name === 'AccessDeniedException' ||
        error.name === 'NotAuthorizedException' ||
        error.name === 'ResourceNotFoundException'
      ) {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError(error.message);
      }
      if (error.name === 'AliasExistsException' || error.name === 'InvalidParameterException') {
        throw new InvalidParameterError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Deletes a user from the user pool.
   *
   * @param id - the id of the user to delete
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin dones't have permission to delete a user from a user pool
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesnt exist in the user pool
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   */
  public async deleteUser(id: string): Promise<void> {
    try {
      await this._aws.clients.cognito.adminDeleteUser({
        UserPoolId: this._userPoolId,
        Username: id
      });
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (
        error.name === 'AccessDeniedException' ||
        error.name === 'NotAuthorizedException' ||
        error.name === 'ResourceNotFoundException'
      ) {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Activates an inactive user.
   *
   * @param id - the id of the user to activate
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin dones't have permission to activate a user
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesnt exist in the user pool
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   */
  public async activateUser(id: string): Promise<void> {
    try {
      await this._aws.clients.cognito.adminEnableUser({
        UserPoolId: this._userPoolId,
        Username: id
      });
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (
        error.name === 'AccessDeniedException' ||
        error.name === 'NotAuthorizedException' ||
        error.name === 'ResourceNotFoundException'
      ) {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Deactivates an active user.
   *
   * @param id - the id of the user to deactivate
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin dones't have permission to deactivate a user
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesnt exist in the user pool
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   */
  public async deactivateUser(id: string): Promise<void> {
    try {
      await this._aws.clients.cognito.adminDisableUser({
        UserPoolId: this._userPoolId,
        Username: id
      });
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (
        error.name === 'AccessDeniedException' ||
        error.name === 'NotAuthorizedException' ||
        error.name === 'ResourceNotFoundException'
      ) {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Lists the users within the user pool.
   *
   * @param request - the request object according to {@link ListUsersRequest}
   * @returns a {@link ListUsersResponse} object
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to list the users in a user pool
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   * @throws {@link InvalidPaginationTokenError} if the passed pagination token is invalid
   */
  public async listUsers(request: ListUsersRequest): Promise<ListUsersResponse> {
    try {
      const response = await this._aws.clients.cognito.listUsers({
        UserPoolId: this._userPoolId,
        Limit: request.pageSize,
        PaginationToken: request.paginationToken
          ? Buffer.from(request.paginationToken, 'base64').toString('utf8')
          : undefined
      });

      if (!response.Users) {
        return { data: [] };
      }

      const users = await Promise.all(
        response.Users.map(async (user) => {
          const roles = await this.getUserRoles(user.Username ?? '');

          return {
            id: user.Username ?? '',
            firstName: user.Attributes?.find((attr) => attr.Name === 'given_name')?.Value ?? '',
            lastName: user.Attributes?.find((attr) => attr.Name === 'family_name')?.Value ?? '',
            email: user.Attributes?.find((attr) => attr.Name === 'email')?.Value ?? '',
            status: user.Enabled ? Status.ACTIVE : Status.INACTIVE,
            roles
          };
        })
      );

      const data = users.filter((user) => user.id);

      if (!response.PaginationToken) {
        return { data };
      }

      return { data, paginationToken: Buffer.from(response.PaginationToken).toString('base64') };
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (
        error.name === 'AccessDeniedException' ||
        error.name === 'NotAuthorizedException' ||
        error.name === 'ResourceNotFoundException'
      ) {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      if (error.name === 'InvalidParameterException') {
        throw new InvalidParameterError('Invalid parameter');
      }
      throw error;
    }
  }

  /**
   * Lists the user ids associated with a given group.
   *
   * @param request - a ListUsersForRoleRequest object
   * @returns an array containing the user ids that are associated with the group
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to list the users within a group
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link RoleNotFoundError} if the group provided doesn't exist in the user pool
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   */
  public async listUsersForRole(request: ListUsersForRoleRequest): Promise<PaginatedResponse<string>> {
    try {
      const groupId = `${request.projectId}#${request.role}`;
      const response = await this._aws.clients.cognito.listUsersInGroup({
        UserPoolId: this._userPoolId,
        GroupName: groupId,
        Limit: request.pageSize,
        NextToken: request.paginationToken
          ? Buffer.from(request.paginationToken, 'base64').toString('utf8')
          : undefined
      });

      const users = response.Users;

      if (!users || users.length === 0) {
        return {
          data: []
        };
      }

      const userNames: string[] = [];

      for (const user of users) {
        if (!user.Username) {
          continue;
        }

        userNames.push(user.Username);
      }

      return {
        data: userNames,
        paginationToken: response.NextToken ? Buffer.from(response.NextToken).toString('base64') : undefined
      };
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (error.name === 'AccessDeniedException' || error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'ResourceNotFoundException') {
        if (error.message === 'Group not found.') {
          throw new RoleNotFoundError('Role does not exist.');
        }
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'InvalidParameterException') {
        throw new InvalidParameterError('Invalid parameter');
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Lists the currently available groups in the user pool.
   *
   * @returns an array containing the names of the groups in the user pool
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to list the groups in a user pool
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   */
  public async listRoles(): Promise<string[]> {
    try {
      const { Groups: groups } = await this._aws.clients.cognito.listGroups({
        UserPoolId: this._userPoolId
      });

      return groups?.map((group) => group.GroupName ?? '').filter((group) => group) ?? [];
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (
        error.name === 'AccessDeniedException' ||
        error.name === 'NotAuthorizedException' ||
        error.name === 'ResourceNotFoundException'
      ) {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Adds the given user to the given group in the user pool.
   *
   * @param id - the username of the user
   * @param role - the group to add the user to
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to add a user to a user pool group
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesn't exist in the user pool
   * @throws {@link RoleNotFoundError} if the group provided doesn't exist in the user pool
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   * @throws {@link UserRolesExceedLimitError} if user has reached Cognito group limit
   */
  public async addUserToRole(id: string, role: string): Promise<void> {
    try {
      // check if user has reached role limits
      const existingRoles = await this.getUserRoles(id);
      if (existingRoles.length >= this.userRoleLimit) {
        throw new UserRolesExceedLimitError(
          `This user has reached Cognito group limit: ${this.userRoleLimit}`
        );
      }

      await this._aws.clients.cognito.adminAddUserToGroup({
        UserPoolId: this._userPoolId,
        Username: id,
        GroupName: role
      });
      // Temporarily allow user access to the group
      await this._modifyTempRoleAccess({
        userId: id,
        roleId: role,
        access: 'ALLOW'
      });
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (error.name === 'AccessDeniedException' || error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'ResourceNotFoundException') {
        if (error.message === 'Group not found.') {
          throw new RoleNotFoundError('Role does not exist.');
        }
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Removes the given user from the given group in the user pool.
   *
   * @param id - the username of the user
   * @param role - the group to remove the user from
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to remove a user from a user pool group
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesn't exist in the user pool
   * @throws {@link RoleNotFoundError} if the group provided doesn't exist in the user pool
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   */
  public async removeUserFromRole(id: string, role: string): Promise<void> {
    try {
      await this._aws.clients.cognito.adminRemoveUserFromGroup({
        UserPoolId: this._userPoolId,
        Username: id,
        GroupName: role
      });
      // Temporarily deny user access to the group
      await this._modifyTempRoleAccess({
        userId: id,
        roleId: role,
        access: 'DENY'
      });
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (error.name === 'AccessDeniedException' || error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'ResourceNotFoundException') {
        if (error.message === 'Group not found.') {
          throw new RoleNotFoundError(error.message);
        }
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Creates a new group in the user pool.
   *
   * @param role - the group to create
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to create a user pool group
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link RoleAlreadyExistsError} if the group provided already exists in the user pool
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   */
  public async createRole(role: string): Promise<void> {
    try {
      await this._aws.clients.cognito.createGroup({
        UserPoolId: this._userPoolId,
        GroupName: role
      });
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (
        error.name === 'AccessDeniedException' ||
        error.name === 'NotAuthorizedException' ||
        error.name === 'ResourceNotFoundException'
      ) {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'GroupExistsException') {
        throw new RoleAlreadyExistsError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Deletes the given group in the user pool.
   *
   * @param role - the group to delete
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to delete a user pool group
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link RoleNotFoundError} if the group provided doesn't exist in the user pool
   * @throws {@link TooManyRequestsError} if the RPS limit was exceeded
   */
  public async deleteRole(role: string): Promise<void> {
    try {
      await this._clearAllTempRoleAccessByRole({
        roleId: role
      });
      await this._aws.clients.cognito.deleteGroup({
        UserPoolId: this._userPoolId,
        GroupName: role
      });
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError(error.message);
      }
      if (error.name === 'AccessDeniedException' || error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'ResourceNotFoundException') {
        if (error.message === 'Group not found.') {
          throw new RoleNotFoundError(error.message);
        }
        throw new PluginConfigurationError(error.message);
      }
      if (error.name === 'TooManyRequestsException') {
        throw new TooManyRequestsError(error.message);
      }
      throw error;
    }
  }

  /**
   * Validate user roles to ensure given/revoked roles are modified.
   * @param userId - ID of the user to be validated
   * @param roles - roles of the user to be validated
   *
   * @returns - a list of validated user roles
   */
  public async validateUserRoles(userId: string, roles: string[]): Promise<string[]> {
    // No settings for temp role access
    if (!this._tempRoleAccessSettings) return roles;
    //retrieve the access list and remove and add roles if necessary
    const setOfRoleIds = new Set(roles);
    const key = {
      name: 'pk',
      value: buildDynamoDbKey(userId, this._tempRoleAccessEntryPrefix)
    };

    const tempRoleAccessResults = await this._tempRoleAccessSettings.ddbService
      .query({
        key
      })
      .execute();

    if (tempRoleAccessResults.Items) {
      tempRoleAccessResults.Items.forEach((item) => {
        const tempRoleAccessEntry = TempRoleAccessEntryParser.parse(item);
        const expired = Math.round(Date.now() / 1000) > tempRoleAccessEntry.expirationTime;
        if (!expired) {
          if (tempRoleAccessEntry.access === 'ALLOW') setOfRoleIds.add(tempRoleAccessEntry.roleId);
          else if (tempRoleAccessEntry.access === 'DENY') setOfRoleIds.delete(tempRoleAccessEntry.roleId);
        }
      });
    }
    return Array.from(setOfRoleIds.values());
  }

  private async _clearAllTempRoleAccessByRole(params: { roleId: string }): Promise<void> {
    if (!this._tempRoleAccessSettings) return;
    const { roleId } = params;
    const allTempRoleAccessKeys: { pk: string; sk: string }[] = [];
    let paginationToken = undefined;
    const identity = buildDynamoDbKey(roleId, this._tempRoleAccessEntryPrefix);
    let queryParams: QueryParams = {
      //Leveraging GSI that currently exists
      index: 'getIdentityPermissionsByIdentity',
      key: {
        name: 'identity',
        value: identity
      }
    };
    do {
      queryParams = addPaginationToken(paginationToken, queryParams);
      const roleTempAcesssValuResponse = await this._tempRoleAccessSettings.ddbService.getPaginatedItems(
        queryParams
      );

      const data = roleTempAcesssValuResponse.data;
      data.forEach((item) => {
        const tempRoleAccessItem = TempRoleAccessItemParser.parse(item);
        const { pk, sk } = tempRoleAccessItem;
        allTempRoleAccessKeys.push({
          pk,
          sk
        });
      });
      paginationToken = roleTempAcesssValuResponse.paginationToken;
    } while (paginationToken);

    const batchDeletePromises: Promise<BatchWriteItemCommandOutput>[] = [];
    _.chunk(allTempRoleAccessKeys, 25).forEach((tempRoleAccessKeys) => {
      const batchDeletePromise = this._tempRoleAccessSettings!.ddbService.batchEdit({
        addDeleteRequests: tempRoleAccessKeys
      }).execute();
      batchDeletePromises.push(batchDeletePromise);
    });
    await Promise.all(batchDeletePromises);
  }

  private async _modifyTempRoleAccess(params: {
    userId: string;
    roleId: string;
    access: AccessType;
  }): Promise<void> {
    // No settings for temp role access
    if (!this._tempRoleAccessSettings) return;
    const { userId, roleId, access } = params;
    //add the roles permissions to the ddb service
    const pk = buildDynamoDbKey(userId, this._tempRoleAccessEntryPrefix);
    const sk = buildDynamoDbKey(roleId, this._tempRoleAccessEntryPrefix);
    const tempRoleAccessEntryKey = {
      pk,
      sk
    };
    const ttl = this._tempRoleAccessSettings.ttl ?? this._defaultTempRoleAccesssTTL;
    const tempRoleAccessEntry: TempRoleAccessEntry = {
      roleId: roleId,
      access: access,
      identity: sk,
      expirationTime: Math.round(Date.now() / 1000) + ttl
    };

    await this._tempRoleAccessSettings.ddbService.updateExecuteAndFormat({
      key: tempRoleAccessEntryKey,
      params: {
        item: tempRoleAccessEntry
      }
    });
  }
}
