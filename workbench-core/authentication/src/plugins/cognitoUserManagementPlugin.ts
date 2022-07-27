/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
  AdminRemoveUserFromGroupCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  DeleteGroupCommand,
  DeliveryMediumType,
  ListGroupsCommand,
  ListUsersCommand,
  ListUsersInGroupCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { IdpUnavailableError } from '../errors/idpUnavailableError';
import { InvalidParameterError } from '../errors/invalidParameterError';
import { PluginConfigurationError } from '../errors/pluginConfigurationError';
import { RoleAlreadyExistsError } from '../errors/roleAlreadyExistsError';
import { RoleNotFoundError } from '../errors/roleNotFoundError';
import { UserAlreadyExistsError } from '../errors/userAlreadyExistsError';
import { UserNotFoundError } from '../errors/userNotFoundError';
import { User } from '../user';
import { UserManagementPlugin } from '../userManagementPlugin';

/**
 * A CognitoUserManagementPlugin instance that interfaces with Cognito to provide user management services.
 */
export class CognitoUserManagementPlugin implements UserManagementPlugin {
  private _userPoolId: string;

  private _cognitoClient: CognitoIdentityProviderClient;

  /**
   *
   * @param userPoolId - the user pool id to update with the plugin
   */
  public constructor(userPoolId: string) {
    this._userPoolId = userPoolId;

    // eslint-disable-next-line security/detect-unsafe-regex
    const regionMatch = userPoolId.match(/^(?<region>(\w+-)?\w+-\w+-\d)+_\w+$/);

    if (!regionMatch) {
      throw new PluginConfigurationError('Invalid Cognito user pool id');
    }

    const region = regionMatch.groups!.region;

    this._cognitoClient = new CognitoIdentityProviderClient({ region });
  }

  /**
   * Gets the details for a certain user.
   *
   * @param uid - the user id to get details for
   * @returns a {@link User} object containing the user's details
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to get user info
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesnt exist in the user pool
   */
  public async getUser(uid: string): Promise<User> {
    try {
      const { UserAttributes: userAttributes } = await this._cognitoClient.send(
        new AdminGetUserCommand({
          UserPoolId: this._userPoolId,
          Username: uid
        })
      );

      const { Groups: groups } = await this._cognitoClient.send(
        new AdminListGroupsForUserCommand({
          UserPoolId: this._userPoolId,
          Username: uid
        })
      );

      return {
        uid,
        firstName: userAttributes?.find((attr) => attr.Name === 'given_name')?.Value ?? '',
        lastName: userAttributes?.find((attr) => attr.Name === 'family_name')?.Value ?? '',
        email: userAttributes?.find((attr) => attr.Name === 'email')?.Value ?? '',
        roles: groups?.map((group) => group.GroupName ?? '').filter((group) => group) ?? []
      };
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError('Cognito encountered an internal error');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError('Plugin is not authorized to get user info');
      }
      if (error.name === 'ResourceNotFoundException') {
        throw new PluginConfigurationError('Invalid user pool id');
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError('User does not exist');
      }
      throw error;
    }
  }

  /**
   * Creates a new user with the given details. Roles need to be added with `addUserToRole()`.
   *
   * @param user - the user to create
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to add a user to a user pool
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserAlreadyExistsError} if the user id or email provided is already in use in the user pool
   * @throws {@link InvalidParameterError} if the email parameter is not in a valid format
   */
  public async createUser(user: Omit<User, 'roles'>): Promise<void> {
    try {
      await this._cognitoClient.send(
        new AdminCreateUserCommand({
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
        })
      );
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError('Cognito encountered an internal error');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError('Plugin is not authorized to create a user');
      }
      if (error.name === 'ResourceNotFoundException') {
        throw new PluginConfigurationError('Invalid user pool id');
      }
      if (error.name === 'UsernameExistsException') {
        if (error.message === 'An account with the email already exists.') {
          throw new UserAlreadyExistsError('A user with this email already exists');
        }
        throw new UserAlreadyExistsError('A user with this user ID already exists');
      }
      if (error.name === 'InvalidParameterException') {
        throw new InvalidParameterError('Invalid email');
      }
      throw error;
    }
  }

  /**
   * Updates a user with new details. Roles and uid will not be updated.
   *
   * @param uid - the id of the user to update
   * @param user - the information to update
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to update user info
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesnt exist in the user pool
   * @throws {@link InvalidParameterError} if the email parameter is not in a valid format
   */
  public async updateUser(uid: string, user: Omit<User, 'uid' | 'roles'>): Promise<void> {
    try {
      await this._cognitoClient.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: this._userPoolId,
          Username: uid,
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
        })
      );
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError('Cognito encountered an internal error');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError('Plugin is not authorized to update user info');
      }
      if (error.name === 'ResourceNotFoundException') {
        throw new PluginConfigurationError('Invalid user pool id');
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError('User does not exist');
      }
      if (error.name === 'InvalidParameterException') {
        throw new InvalidParameterError('Invalid email');
      }
      throw error;
    }
  }

  /**
   * Deletes a user from the user pool.
   *
   * @param uid - the id of the user to delete
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin dones't have permission to delete a user from a user pool
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesnt exist in the user pool
   */
  public async deleteUser(uid: string): Promise<void> {
    try {
      await this._cognitoClient.send(
        new AdminDeleteUserCommand({
          UserPoolId: this._userPoolId,
          Username: uid
        })
      );
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError('Cognito encountered an internal error');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError('Plugin is not authorized to delete a user');
      }
      if (error.name === 'ResourceNotFoundException') {
        throw new PluginConfigurationError('Invalid user pool id');
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError('User does not exist');
      }
      throw error;
    }
  }

  /**
   * Lists the user ids within the user pool.
   *
   * @returns an array containing the user ids within the user pool
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to list the users in a user pool
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   */
  public async listUsers(): Promise<string[]> {
    try {
      const { Users: users } = await this._cognitoClient.send(
        new ListUsersCommand({
          UserPoolId: this._userPoolId
        })
      );

      return users?.map((user) => user.Username ?? '').filter((username) => username) ?? [];
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError('Cognito encountered an internal error');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError('Plugin is not authorized to list the users in the user pool');
      }
      if (error.name === 'ResourceNotFoundException') {
        throw new PluginConfigurationError('Invalid user pool id');
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
      const { Users: users } = await this._cognitoClient.send(
        new ListUsersInGroupCommand({
          UserPoolId: this._userPoolId,
          GroupName: role
        })
      );

      return users?.map((user) => user.Username ?? '').filter((username) => username) ?? [];
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError('Cognito encountered an internal error');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError('Plugin is not authorized to list the users within a group');
      }
      if (error.name === 'ResourceNotFoundException') {
        if (error.message === 'Group not found.') {
          throw new RoleNotFoundError('Role does not exist');
        }
        throw new PluginConfigurationError('Invalid user pool id');
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
      const { Groups: groups } = await this._cognitoClient.send(
        new ListGroupsCommand({
          UserPoolId: this._userPoolId
        })
      );

      return groups?.map((group) => group.GroupName ?? '').filter((group) => group) ?? [];
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError('Cognito encountered an internal error');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError('Plugin is not authorized to list the groups in the user pool');
      }
      if (error.name === 'ResourceNotFoundException') {
        throw new PluginConfigurationError('Invalid user pool id');
      }
      throw error;
    }
  }

  /**
   * Adds the given user to the given group in the user pool.
   *
   * @param uid - the username of the user
   * @param role - the group to add the user to
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to add a user to a user pool group
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesn't exist in the user pool
   * @throws {@link RoleNotFoundError} if the group provided doesn't exist in the user pool
   */
  public async addUserToRole(uid: string, role: string): Promise<void> {
    try {
      await this._cognitoClient.send(
        new AdminAddUserToGroupCommand({
          UserPoolId: this._userPoolId,
          Username: uid,
          GroupName: role
        })
      );
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError('Cognito encountered an internal error');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError('Plugin is not authorized to add a user to a user pool group');
      }
      if (error.name === 'ResourceNotFoundException') {
        if (error.message === 'Group not found.') {
          throw new RoleNotFoundError('Role does not exist');
        }
        throw new PluginConfigurationError('Invalid user pool id');
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError('User does not exist');
      }
      throw error;
    }
  }

  /**
   * Removes the given user from the given group in the user pool.
   *
   * @param uid - the username of the user
   * @param role - the group to remove the user from
   *
   * @throws {@link IdpUnavailableError} if Cognito encounters an internal error
   * @throws {@link PluginConfigurationError} if the plugin doesn't have permission to remove a user from a user pool group
   * @throws {@link PluginConfigurationError} if the user pool id is invalid
   * @throws {@link UserNotFoundError} if the user provided doesn't exist in the user pool
   * @throws {@link RoleNotFoundError} if the group provided doesn't exist in the user pool
   */
  public async removeUserFromRole(uid: string, role: string): Promise<void> {
    try {
      await this._cognitoClient.send(
        new AdminRemoveUserFromGroupCommand({
          UserPoolId: this._userPoolId,
          Username: uid,
          GroupName: role
        })
      );
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError('Cognito encountered an internal error');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError(
          'Plugin is not authorized to remove a user from a user pool group'
        );
      }
      if (error.name === 'ResourceNotFoundException') {
        if (error.message === 'Group not found.') {
          throw new RoleNotFoundError('Role does not exist');
        }
        throw new PluginConfigurationError('Invalid user pool id');
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError('User does not exist');
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
      await this._cognitoClient.send(
        new CreateGroupCommand({
          UserPoolId: this._userPoolId,
          GroupName: role
        })
      );
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError('Cognito encountered an internal error');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError('Plugin is not authorized to create a user pool group');
      }
      if (error.name === 'ResourceNotFoundException') {
        throw new PluginConfigurationError('Invalid user pool id');
      }
      if (error.name === 'GroupExistsException') {
        throw new RoleAlreadyExistsError('A group with this name already exists');
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
      await this._cognitoClient.send(
        new DeleteGroupCommand({
          UserPoolId: this._userPoolId,
          GroupName: role
        })
      );
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError('Cognito encountered an internal error');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError('Plugin is not authorized to delete a user pool group');
      }
      if (error.name === 'ResourceNotFoundException') {
        if (error.message === 'Group not found.') {
          throw new RoleNotFoundError('Role does not exist');
        }
        throw new PluginConfigurationError('Invalid user pool id');
      }
      throw error;
    }
  }
}
