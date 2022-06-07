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
import { User } from '../user';
import { RoleAlreadyExistsError } from '../errors/roleAlreadyExistsError';
import { IdpUnavailableError } from '../errors/idpUnavailableError';
import { PluginConfigurationError } from '../errors/pluginConfigurationError';
import { RoleNotFoundError } from '../errors/roleNotFoundError';
import { UserNotFoundError } from '../errors/userNotFoundError';
import { UserManagementPlugin } from '../userManagementPlugin';
import { UserAlreadyExistsError } from '../errors/userAlreadyExistsError';
import { InvalidParameterError } from '../errors/invalidParameterError';

export interface CognitoUserManagementPluginOptions {
  region: string;
  userPoolId: string;
}

export class CognitoUserManagementPlugin implements UserManagementPlugin {
  private _userPoolId: string;

  private _cognitoClient: CognitoIdentityProviderClient;

  public constructor({ region, userPoolId }: CognitoUserManagementPluginOptions) {
    this._userPoolId = userPoolId;

    this._cognitoClient = new CognitoIdentityProviderClient({ region });
  }

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
        throw new PluginConfigurationError('Plugin is not authorized to create a user pool group');
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

  public async createUser(user: Omit<User, 'roles'>): Promise<void> {
    try {
      await this._cognitoClient.send(
        new AdminCreateUserCommand({
          UserPoolId: this._userPoolId,
          Username: user.uid,
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
        throw new PluginConfigurationError('Plugin is not authorized to create a user pool group');
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
      if (error.name === ' InvalidParameterException') {
        throw new InvalidParameterError('Invalid email');
      }
      throw error;
    }
  }

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
        throw new PluginConfigurationError('Plugin is not authorized to create a user pool group');
      }
      if (error.name === 'ResourceNotFoundException') {
        throw new PluginConfigurationError('Invalid user pool id');
      }
      if (error.name === 'UserNotFoundException') {
        throw new UserNotFoundError('User does not exist');
      }
      if (error.name === ' InvalidParameterException') {
        throw new InvalidParameterError('Invalid email');
      }
      throw error;
    }
  }

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
        throw new PluginConfigurationError('Plugin is not authorized to create a user pool group');
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

  public async listUsers(): Promise<string[]> {
    try {
      const { Users: users } = await this._cognitoClient.send(
        new ListUsersCommand({
          UserPoolId: this._userPoolId
        })
      );

      return users?.map((user) => user.Username ?? '') ?? [];
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
      throw error;
    }
  }

  public async listUsersForRole(role: string): Promise<string[]> {
    try {
      const { Users: users } = await this._cognitoClient.send(
        new ListUsersInGroupCommand({
          UserPoolId: this._userPoolId,
          GroupName: role
        })
      );

      return users?.map((user) => user.Username ?? '') ?? [];
    } catch (error) {
      if (error.name === 'InternalErrorException') {
        throw new IdpUnavailableError('Cognito encountered an internal error');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new PluginConfigurationError('Plugin is not authorized to create a user pool group');
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

  public async listRoles(): Promise<string[]> {
    try {
      const { Groups: groups } = await this._cognitoClient.send(
        new ListGroupsCommand({
          UserPoolId: this._userPoolId
        })
      );

      return groups?.map((group) => group.GroupName ?? '') ?? [];
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
      throw error;
    }
  }

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
        throw new PluginConfigurationError('Plugin is not authorized to create a user pool group');
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
        throw new PluginConfigurationError('Plugin is not authorized to create a user pool group');
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
