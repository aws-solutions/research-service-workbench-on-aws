/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DeliveryMediumType } from '@aws-sdk/client-cognito-identity-provider';
import { AwsService } from '@aws/workbench-core-base';
import { IdpUnavailableError } from '../errors/idpUnavailableError';
import { InvalidParameterError } from '../errors/invalidParameterError';
import { PluginConfigurationError } from '../errors/pluginConfigurationError';
import { RoleAlreadyExistsError } from '../errors/roleAlreadyExistsError';
import { RoleNotFoundError } from '../errors/roleNotFoundError';
import { TooManyRequestsError } from '../errors/tooManyRequestsError';
import { UserAlreadyExistsError } from '../errors/userAlreadyExistsError';
import { UserNotFoundError } from '../errors/userNotFoundError';
import { CreateUser, Status, User } from '../user';
import { UserManagementPlugin } from '../userManagementPlugin';

/**
 * A CognitoUserManagementPlugin instance that interfaces with Cognito to provide user management services.
 */
export class CognitoUserManagementPlugin implements UserManagementPlugin {
  private _userPoolId: string;
  private _aws: AwsService;

  /**
   *
   * @param userPoolId - the user pool id to update with the plugin
   * @param aws - a {@link AwsService} instance with permissions to perform Cognito actions
   */
  public constructor(userPoolId: string, aws: AwsService) {
    this._userPoolId = userPoolId;

    this._aws = aws;
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
   */
  public async getUserRoles(id: string): Promise<string[]> {
    try {
      const { Groups: groups } = await this._aws.clients.cognito.adminListGroupsForUser({
        UserPoolId: this._userPoolId,
        Username: id
      });

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
   * @returns an array of {@link User}s
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to list the users in a user pool
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   */
  public async listUsers(): Promise<User[]> {
    try {
      const response = await this._aws.clients.cognito.listUsers({
        UserPoolId: this._userPoolId
      });

      if (!response.Users) {
        return [];
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

      return users.filter((user) => user.id);
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
   * Lists the user ids associated with a given group.
   *
   * @param role - the group to list the users associated with it
   * @returns an array containing the user ids that are associated with the group
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to list the users within a group
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link RoleNotFoundError} if the group provided doesn't exist in the user pool
   */
  public async listUsersForRole(role: string): Promise<string[]> {
    try {
      const { Users: users } = await this._aws.clients.cognito.listUsersInGroup({
        UserPoolId: this._userPoolId,
        GroupName: role
      });

      return users?.map((user) => user.Username ?? '').filter((username) => username) ?? [];
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
   */
  public async addUserToRole(id: string, role: string): Promise<void> {
    try {
      await this._aws.clients.cognito.adminAddUserToGroup({
        UserPoolId: this._userPoolId,
        Username: id,
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
   */
  public async removeUserFromRole(id: string, role: string): Promise<void> {
    try {
      await this._aws.clients.cognito.adminRemoveUserFromGroup({
        UserPoolId: this._userPoolId,
        Username: id,
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
   */
  public async deleteRole(role: string): Promise<void> {
    try {
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
}
