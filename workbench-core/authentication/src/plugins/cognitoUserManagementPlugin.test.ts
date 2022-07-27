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
  GroupExistsException,
  InternalErrorException,
  InvalidParameterException,
  ListGroupsCommand,
  ListUsersCommand,
  ListUsersInGroupCommand,
  NotAuthorizedException,
  ResourceNotFoundException,
  UsernameExistsException,
  UserNotFoundException
} from '@aws-sdk/client-cognito-identity-provider';
import { mockClient } from 'aws-sdk-client-mock';
import {
  CognitoUserManagementPlugin,
  IdpUnavailableError,
  InvalidParameterError,
  PluginConfigurationError,
  RoleAlreadyExistsError,
  RoleNotFoundError,
  User,
  UserAlreadyExistsError,
  UserNotFoundError
} from '..';
import { UserManagementPlugin } from '../userManagementPlugin';

const userInfo: Omit<User, 'roles'> = {
  uid: '123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@doe.com'
} as const;

const cognitoMock = mockClient(CognitoIdentityProviderClient);

describe('CognitoUserManagementPlugin tests', () => {
  let plugin: UserManagementPlugin;
  let roles: string[];

  beforeEach(() => {
    cognitoMock.reset();
    plugin = new CognitoUserManagementPlugin('us-west-2_fakeId');
    roles = ['Role1', 'Role2'];
  });

  describe('constructor tests', () => {
    it('should throw PluginConfigurationError when the userPoolId is invalid', async () => {
      expect(() => {
        new CognitoUserManagementPlugin('bad-user-pool-id');
      }).toThrow(PluginConfigurationError);
    });
  });

  describe('getUser tests', () => {
    it('should return the requested User when it exists', async () => {
      cognitoMock.on(AdminGetUserCommand).resolves({
        UserAttributes: [
          { Name: 'given_name', Value: userInfo.firstName },
          { Name: 'family_name', Value: userInfo.lastName },
          { Name: 'email', Value: userInfo.email }
        ]
      });
      cognitoMock
        .on(AdminListGroupsForUserCommand)
        .resolves({ Groups: roles.map((role) => ({ GroupName: role })) });

      const user = await plugin.getUser(userInfo.uid);

      expect(user).toMatchObject<User>({
        ...userInfo,
        roles
      });
    });

    it('should return an empty string for the Users first name when it is not set', async () => {
      cognitoMock.on(AdminGetUserCommand).resolves({
        UserAttributes: [
          { Name: 'family_name', Value: userInfo.lastName },
          { Name: 'email', Value: userInfo.email }
        ]
      });
      cognitoMock
        .on(AdminListGroupsForUserCommand)
        .resolves({ Groups: roles.map((role) => ({ GroupName: role })) });

      const user = await plugin.getUser(userInfo.uid);

      expect(user).toMatchObject<User>({
        ...userInfo,
        firstName: '',
        roles
      });
    });

    it('should return an empty string for the Users last name when it is not set', async () => {
      cognitoMock.on(AdminGetUserCommand).resolves({
        UserAttributes: [
          { Name: 'given_name', Value: userInfo.firstName },
          { Name: 'email', Value: userInfo.email }
        ]
      });
      cognitoMock
        .on(AdminListGroupsForUserCommand)
        .resolves({ Groups: roles.map((role) => ({ GroupName: role })) });

      const user = await plugin.getUser(userInfo.uid);

      expect(user).toMatchObject<User>({
        ...userInfo,
        lastName: '',
        roles
      });
    });

    it('should return an empty string for the Users email when it is not set', async () => {
      cognitoMock.on(AdminGetUserCommand).resolves({
        UserAttributes: [
          { Name: 'given_name', Value: userInfo.firstName },
          { Name: 'family_name', Value: userInfo.lastName }
        ]
      });
      cognitoMock
        .on(AdminListGroupsForUserCommand)
        .resolves({ Groups: roles.map((role) => ({ GroupName: role })) });

      const user = await plugin.getUser(userInfo.uid);

      expect(user).toMatchObject<User>({
        ...userInfo,
        email: '',
        roles
      });
    });

    it('should return an empty array for the Users roles when no roles are assigned to it', async () => {
      cognitoMock.on(AdminGetUserCommand).resolves({
        UserAttributes: [
          { Name: 'given_name', Value: userInfo.firstName },
          { Name: 'family_name', Value: userInfo.lastName },
          { Name: 'email', Value: userInfo.email }
        ]
      });
      cognitoMock.on(AdminListGroupsForUserCommand).resolves({});

      const user = await plugin.getUser(userInfo.uid);

      expect(user).toMatchObject<User>({
        ...userInfo,
        roles: []
      });
    });

    it('should return an empty string for the Users first name, last name, and email when the user doesnt have an attributes field', async () => {
      cognitoMock.on(AdminGetUserCommand).resolves({});
      cognitoMock
        .on(AdminListGroupsForUserCommand)
        .resolves({ Groups: roles.map((role) => ({ GroupName: role })) });

      const user = await plugin.getUser(userInfo.uid);

      expect(user).toMatchObject<User>({
        ...userInfo,
        firstName: '',
        lastName: '',
        email: '',
        roles
      });
    });

    it('should return an empty array for the Users roles when the groups dont have names', async () => {
      cognitoMock.on(AdminGetUserCommand).resolves({
        UserAttributes: [
          { Name: 'given_name', Value: userInfo.firstName },
          { Name: 'family_name', Value: userInfo.lastName },
          { Name: 'email', Value: userInfo.email }
        ]
      });
      cognitoMock.on(AdminListGroupsForUserCommand).resolves({ Groups: roles.map(() => ({})) });

      const user = await plugin.getUser(userInfo.uid);

      expect(user).toMatchObject<User>({
        ...userInfo,
        roles: []
      });
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      cognitoMock.on(AdminGetUserCommand).rejects(new InternalErrorException({ $metadata: {} }));

      await expect(plugin.getUser(userInfo.uid)).rejects.toThrow(
        new IdpUnavailableError('Cognito encountered an internal error')
      );
    });

    it('should throw PluginConfigurationError when the plugin is not authorized to perform the action', async () => {
      cognitoMock.on(AdminGetUserCommand).rejects(new NotAuthorizedException({ $metadata: {} }));

      await expect(plugin.getUser(userInfo.uid)).rejects.toThrow(
        new PluginConfigurationError('Plugin is not authorized to get user info')
      );
    });

    it('should throw PluginConfigurationError when the user pool id is invalid', async () => {
      cognitoMock.on(AdminGetUserCommand).rejects(new ResourceNotFoundException({ $metadata: {} }));

      await expect(plugin.getUser(userInfo.uid)).rejects.toThrow(
        new PluginConfigurationError('Invalid user pool id')
      );
    });

    it('should throw UserNotFoundError when the user doesnt exist in the user pool', async () => {
      cognitoMock.on(AdminGetUserCommand).rejects(new UserNotFoundException({ $metadata: {} }));

      await expect(plugin.getUser(userInfo.uid)).rejects.toThrow(
        new UserNotFoundError('User does not exist')
      );
    });

    it('should rethrow an error when the error is unexpected', async () => {
      cognitoMock.on(AdminGetUserCommand).rejects(new Error());

      await expect(plugin.getUser(userInfo.uid)).rejects.toThrow(Error);
    });
  });

  describe('createUser tests', () => {
    it('should create the requested User when all params are valid', async () => {
      const createMock = cognitoMock.on(AdminCreateUserCommand).resolves({});

      await plugin.createUser({ ...userInfo, roles });

      expect(createMock.calls().length).toBe(1);
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      cognitoMock.on(AdminCreateUserCommand).rejects(new InternalErrorException({ $metadata: {} }));

      await expect(plugin.createUser({ ...userInfo, roles })).rejects.toThrow(
        new IdpUnavailableError('Cognito encountered an internal error')
      );
    });

    it('should throw PluginConfigurationError when the plugin is not authorized to perform the action', async () => {
      cognitoMock.on(AdminCreateUserCommand).rejects(new NotAuthorizedException({ $metadata: {} }));

      await expect(plugin.createUser({ ...userInfo, roles })).rejects.toThrow(
        new PluginConfigurationError('Plugin is not authorized to create a user')
      );
    });

    it('should throw PluginConfigurationError when the user pool id is invalid', async () => {
      cognitoMock.on(AdminCreateUserCommand).rejects(new ResourceNotFoundException({ $metadata: {} }));

      await expect(plugin.createUser({ ...userInfo, roles })).rejects.toThrow(
        new PluginConfigurationError('Invalid user pool id')
      );
    });

    it('should throw UserAlreadyExistsError when a user with the user id already exists', async () => {
      cognitoMock.on(AdminCreateUserCommand).rejects(new UsernameExistsException({ $metadata: {} }));

      await expect(plugin.createUser({ ...userInfo, roles })).rejects.toThrow(
        new UserAlreadyExistsError('A user with this user ID already exists')
      );
    });

    it('should throw UserAlreadyExistsError when a user with the email already exists', async () => {
      cognitoMock
        .on(AdminCreateUserCommand)
        .rejects({ name: 'UsernameExistsException', message: 'An account with the email already exists.' });

      await expect(plugin.createUser({ ...userInfo, roles })).rejects.toThrow(
        new UserAlreadyExistsError('A user with this email already exists')
      );
    });

    it('should throw InvalidParameterError the email provided is not in the proper format', async () => {
      cognitoMock.on(AdminCreateUserCommand).rejects(new InvalidParameterException({ $metadata: {} }));

      await expect(plugin.createUser({ ...userInfo, roles })).rejects.toThrow(
        new InvalidParameterError('Invalid email')
      );
    });

    it('should rethrow an error when the error is unexpected', async () => {
      cognitoMock.on(AdminCreateUserCommand).rejects(new Error());

      await expect(plugin.createUser({ ...userInfo, roles })).rejects.toThrow(Error);
    });
  });

  describe('updateUser tests', () => {
    it('should update the requested User when all params are valid', async () => {
      const updateMock = cognitoMock.on(AdminUpdateUserAttributesCommand).resolves({});

      await plugin.updateUser(userInfo.uid, { ...userInfo, roles });

      expect(updateMock.calls().length).toBe(1);
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      cognitoMock.on(AdminUpdateUserAttributesCommand).rejects(new InternalErrorException({ $metadata: {} }));

      await expect(plugin.updateUser(userInfo.uid, { ...userInfo, roles })).rejects.toThrow(
        new IdpUnavailableError('Cognito encountered an internal error')
      );
    });

    it('should throw PluginConfigurationError when the plugin is not authorized to perform the action', async () => {
      cognitoMock.on(AdminUpdateUserAttributesCommand).rejects(new NotAuthorizedException({ $metadata: {} }));

      await expect(plugin.updateUser(userInfo.uid, { ...userInfo, roles })).rejects.toThrow(
        new PluginConfigurationError('Plugin is not authorized to update user info')
      );
    });

    it('should throw PluginConfigurationError when the user pool id is invalid', async () => {
      cognitoMock
        .on(AdminUpdateUserAttributesCommand)
        .rejects(new ResourceNotFoundException({ $metadata: {} }));

      await expect(plugin.updateUser(userInfo.uid, { ...userInfo, roles })).rejects.toThrow(
        new PluginConfigurationError('Invalid user pool id')
      );
    });

    it('should throw UserNotFoundError when the user id doesnt exist in the user pool', async () => {
      cognitoMock.on(AdminUpdateUserAttributesCommand).rejects(new UserNotFoundException({ $metadata: {} }));

      await expect(plugin.updateUser(userInfo.uid, { ...userInfo, roles })).rejects.toThrow(
        new UserAlreadyExistsError('User does not exist')
      );
    });

    it('should throw InvalidParameterError the email provided is not in the proper format', async () => {
      cognitoMock
        .on(AdminUpdateUserAttributesCommand)
        .rejects(new InvalidParameterException({ $metadata: {} }));

      await expect(plugin.updateUser(userInfo.uid, { ...userInfo, roles })).rejects.toThrow(
        new InvalidParameterError('Invalid email')
      );
    });

    it('should rethrow an error when the error is unexpected', async () => {
      cognitoMock.on(AdminUpdateUserAttributesCommand).rejects(new Error());

      await expect(plugin.updateUser(userInfo.uid, { ...userInfo, roles })).rejects.toThrow(Error);
    });
  });

  describe('deleteUser tests', () => {
    it('should delete the requested User when the user id exists', async () => {
      const deleteMock = cognitoMock.on(AdminDeleteUserCommand).resolves({});

      await plugin.deleteUser(userInfo.uid);

      expect(deleteMock.calls().length).toBe(1);
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      cognitoMock.on(AdminDeleteUserCommand).rejects(new InternalErrorException({ $metadata: {} }));

      await expect(plugin.deleteUser(userInfo.uid)).rejects.toThrow(
        new IdpUnavailableError('Cognito encountered an internal error')
      );
    });

    it('should throw PluginConfigurationError when the plugin is not authorized to perform the action', async () => {
      cognitoMock.on(AdminDeleteUserCommand).rejects(new NotAuthorizedException({ $metadata: {} }));

      await expect(plugin.deleteUser(userInfo.uid)).rejects.toThrow(
        new PluginConfigurationError('Plugin is not authorized to delete a user')
      );
    });

    it('should throw PluginConfigurationError when the user pool id is invalid', async () => {
      cognitoMock.on(AdminDeleteUserCommand).rejects(new ResourceNotFoundException({ $metadata: {} }));

      await expect(plugin.deleteUser(userInfo.uid)).rejects.toThrow(
        new PluginConfigurationError('Invalid user pool id')
      );
    });

    it('should throw UserNotFoundError when the user id doesnt exist in the user pool', async () => {
      cognitoMock.on(AdminDeleteUserCommand).rejects(new UserNotFoundException({ $metadata: {} }));

      await expect(plugin.deleteUser(userInfo.uid)).rejects.toThrow(
        new UserAlreadyExistsError('User does not exist')
      );
    });

    it('should rethrow an error when the error is unexpected', async () => {
      cognitoMock.on(AdminDeleteUserCommand).rejects(new Error());

      await expect(plugin.deleteUser(userInfo.uid)).rejects.toThrow(Error);
    });
  });

  describe('listUsers tests', () => {
    it('should return a list of Users in the user pool', async () => {
      cognitoMock.on(ListUsersCommand).resolves({ Users: [{ Username: userInfo.uid }] });

      const users = await plugin.listUsers();

      expect(users.length).toBe(1);
      expect(users).toMatchObject<string[]>([userInfo.uid]);
    });

    it('should return an empty array when no users are in the user pool', async () => {
      cognitoMock.on(ListUsersCommand).resolves({});

      const users = await plugin.listUsers();

      expect(users.length).toBe(0);
      expect(users).toMatchObject<string[]>([]);
    });

    it('should return an empty array when the users dont have user ids', async () => {
      cognitoMock.on(ListUsersCommand).resolves({ Users: [{}] });

      const users = await plugin.listUsers();

      expect(users.length).toBe(0);
      expect(users).toMatchObject<string[]>([]);
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      cognitoMock.on(ListUsersCommand).rejects(new InternalErrorException({ $metadata: {} }));

      await expect(plugin.listUsers()).rejects.toThrow(
        new IdpUnavailableError('Cognito encountered an internal error')
      );
    });

    it('should throw PluginConfigurationError when the plugin is not authorized to perform the action', async () => {
      cognitoMock.on(ListUsersCommand).rejects(new NotAuthorizedException({ $metadata: {} }));

      await expect(plugin.listUsers()).rejects.toThrow(
        new PluginConfigurationError('Plugin is not authorized to list the users in the user pool')
      );
    });

    it('should throw PluginConfigurationError when the user pool id is invalid', async () => {
      cognitoMock.on(ListUsersCommand).rejects(new ResourceNotFoundException({ $metadata: {} }));

      await expect(plugin.listUsers()).rejects.toThrow(new PluginConfigurationError('Invalid user pool id'));
    });

    it('should rethrow an error when the error is unexpected', async () => {
      cognitoMock.on(ListUsersCommand).rejects(new Error());

      await expect(plugin.listUsers()).rejects.toThrow(Error);
    });
  });

  describe('listUsersForRole tests', () => {
    it('should return a list of Users in the given group', async () => {
      cognitoMock.on(ListUsersInGroupCommand).resolves({ Users: [{ Username: userInfo.uid }] });

      const users = await plugin.listUsersForRole(roles[0]);

      expect(users.length).toBe(1);
      expect(users).toMatchObject<string[]>([userInfo.uid]);
    });

    it('should return an empty array when no users are in group', async () => {
      cognitoMock.on(ListUsersInGroupCommand).resolves({});

      const users = await plugin.listUsersForRole(roles[0]);

      expect(users.length).toBe(0);
      expect(users).toMatchObject<string[]>([]);
    });

    it('should return an empty array when the users dont have user ids', async () => {
      cognitoMock.on(ListUsersInGroupCommand).resolves({ Users: [{}] });

      const users = await plugin.listUsersForRole(roles[0]);

      expect(users.length).toBe(0);
      expect(users).toMatchObject<string[]>([]);
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      cognitoMock.on(ListUsersInGroupCommand).rejects(new InternalErrorException({ $metadata: {} }));

      await expect(plugin.listUsersForRole(roles[0])).rejects.toThrow(
        new IdpUnavailableError('Cognito encountered an internal error')
      );
    });

    it('should throw PluginConfigurationError when the plugin is not authorized to perform the action', async () => {
      cognitoMock.on(ListUsersInGroupCommand).rejects(new NotAuthorizedException({ $metadata: {} }));

      await expect(plugin.listUsersForRole(roles[0])).rejects.toThrow(
        new PluginConfigurationError('Plugin is not authorized to list the users within a group')
      );
    });

    it('should throw PluginConfigurationError when the user pool id is invalid', async () => {
      cognitoMock.on(ListUsersInGroupCommand).rejects(new ResourceNotFoundException({ $metadata: {} }));

      await expect(plugin.listUsersForRole(roles[0])).rejects.toThrow(
        new PluginConfigurationError('Invalid user pool id')
      );
    });

    it('should throw RoleNotFoundError when the group doesnt exist in the user pool', async () => {
      cognitoMock
        .on(ListUsersInGroupCommand)
        .rejects({ name: 'ResourceNotFoundException', message: 'Group not found.' });

      await expect(plugin.listUsersForRole(roles[0])).rejects.toThrow(
        new RoleNotFoundError('Role does not exist')
      );
    });

    it('should rethrow an error when the error is unexpected', async () => {
      cognitoMock.on(ListUsersInGroupCommand).rejects(new Error());

      await expect(plugin.listUsersForRole(roles[0])).rejects.toThrow(Error);
    });
  });

  describe('listRoles tests', () => {
    it('should return a list of roles in the user pool', async () => {
      cognitoMock.on(ListGroupsCommand).resolves({ Groups: roles.map((role) => ({ GroupName: role })) });

      const groups = await plugin.listRoles();

      expect(groups.length).toBe(roles.length);
      expect(groups).toMatchObject<string[]>(roles);
    });

    it('should return an empty array when no groups are in the user pool', async () => {
      cognitoMock.on(ListGroupsCommand).resolves({});

      const groups = await plugin.listRoles();

      expect(groups.length).toBe(0);
      expect(groups).toMatchObject<string[]>([]);
    });

    it('should return an empty array when the groups dont have names', async () => {
      cognitoMock.on(ListGroupsCommand).resolves({ Groups: [{}] });

      const groups = await plugin.listRoles();

      expect(groups.length).toBe(0);
      expect(groups).toMatchObject<string[]>([]);
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      cognitoMock.on(ListGroupsCommand).rejects(new InternalErrorException({ $metadata: {} }));

      await expect(plugin.listRoles()).rejects.toThrow(
        new IdpUnavailableError('Cognito encountered an internal error')
      );
    });

    it('should throw PluginConfigurationError when the plugin is not authorized to perform the action', async () => {
      cognitoMock.on(ListGroupsCommand).rejects(new NotAuthorizedException({ $metadata: {} }));

      await expect(plugin.listRoles()).rejects.toThrow(
        new PluginConfigurationError('Plugin is not authorized to list the groups in the user pool')
      );
    });

    it('should throw PluginConfigurationError when the user pool id is invalid', async () => {
      cognitoMock.on(ListGroupsCommand).rejects(new ResourceNotFoundException({ $metadata: {} }));

      await expect(plugin.listRoles()).rejects.toThrow(new PluginConfigurationError('Invalid user pool id'));
    });

    it('should rethrow an error when the error is unexpected', async () => {
      cognitoMock.on(ListGroupsCommand).rejects(new Error());

      await expect(plugin.listRoles()).rejects.toThrow(Error);
    });
  });

  describe('addUserToRole tests', () => {
    it('should add the requested User to the group when the user id and group both exist', async () => {
      const addUserToRoleMock = cognitoMock.on(AdminAddUserToGroupCommand).resolves({});

      await plugin.addUserToRole(userInfo.uid, roles[0]);

      expect(addUserToRoleMock.calls().length).toBe(1);
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      cognitoMock.on(AdminAddUserToGroupCommand).rejects(new InternalErrorException({ $metadata: {} }));

      await expect(plugin.addUserToRole(userInfo.uid, roles[0])).rejects.toThrow(
        new IdpUnavailableError('Cognito encountered an internal error')
      );
    });

    it('should throw PluginConfigurationError when the plugin is not authorized to perform the action', async () => {
      cognitoMock.on(AdminAddUserToGroupCommand).rejects(new NotAuthorizedException({ $metadata: {} }));

      await expect(plugin.addUserToRole(userInfo.uid, roles[0])).rejects.toThrow(
        new PluginConfigurationError('Plugin is not authorized to add a user to a user pool group')
      );
    });

    it('should throw PluginConfigurationError when the user pool id is invalid', async () => {
      cognitoMock.on(AdminAddUserToGroupCommand).rejects(new ResourceNotFoundException({ $metadata: {} }));

      await expect(plugin.addUserToRole(userInfo.uid, roles[0])).rejects.toThrow(
        new PluginConfigurationError('Invalid user pool id')
      );
    });

    it('should throw RoleNotFoundError when the group doesnt exist in the user pool', async () => {
      cognitoMock
        .on(AdminAddUserToGroupCommand)
        .rejects({ name: 'ResourceNotFoundException', message: 'Group not found.' });

      await expect(plugin.addUserToRole(userInfo.uid, roles[0])).rejects.toThrow(
        new RoleNotFoundError('Role does not exist')
      );
    });

    it('should throw UserNotFoundError when the user id doesnt exist in the user pool', async () => {
      cognitoMock.on(AdminAddUserToGroupCommand).rejects(new UserNotFoundException({ $metadata: {} }));

      await expect(plugin.addUserToRole(userInfo.uid, roles[0])).rejects.toThrow(
        new UserAlreadyExistsError('User does not exist')
      );
    });

    it('should rethrow an error when the error is unexpected', async () => {
      cognitoMock.on(AdminAddUserToGroupCommand).rejects(new Error());

      await expect(plugin.addUserToRole(userInfo.uid, roles[0])).rejects.toThrow(Error);
    });
  });

  describe('removeUserFromRole tests', () => {
    it('should remove the requested User from the group when the user id and group both exist', async () => {
      const removeUserFromRoleMock = cognitoMock.on(AdminRemoveUserFromGroupCommand).resolves({});

      await plugin.removeUserFromRole(userInfo.uid, roles[0]);

      expect(removeUserFromRoleMock.calls().length).toBe(1);
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      cognitoMock.on(AdminRemoveUserFromGroupCommand).rejects(new InternalErrorException({ $metadata: {} }));

      await expect(plugin.removeUserFromRole(userInfo.uid, roles[0])).rejects.toThrow(
        new IdpUnavailableError('Cognito encountered an internal error')
      );
    });

    it('should throw PluginConfigurationError when the plugin is not authorized to perform the action', async () => {
      cognitoMock.on(AdminRemoveUserFromGroupCommand).rejects(new NotAuthorizedException({ $metadata: {} }));

      await expect(plugin.removeUserFromRole(userInfo.uid, roles[0])).rejects.toThrow(
        new PluginConfigurationError('Plugin is not authorized to remove a user from a user pool group')
      );
    });

    it('should throw PluginConfigurationError when the user pool id is invalid', async () => {
      cognitoMock
        .on(AdminRemoveUserFromGroupCommand)
        .rejects(new ResourceNotFoundException({ $metadata: {} }));

      await expect(plugin.removeUserFromRole(userInfo.uid, roles[0])).rejects.toThrow(
        new PluginConfigurationError('Invalid user pool id')
      );
    });

    it('should throw RoleNotFoundError when the group doesnt exist in the user pool', async () => {
      cognitoMock
        .on(AdminRemoveUserFromGroupCommand)
        .rejects({ name: 'ResourceNotFoundException', message: 'Group not found.' });

      await expect(plugin.removeUserFromRole(userInfo.uid, roles[0])).rejects.toThrow(
        new RoleNotFoundError('Role does not exist')
      );
    });

    it('should throw UserNotFoundError when the user id doesnt exist in the user pool', async () => {
      cognitoMock.on(AdminRemoveUserFromGroupCommand).rejects(new UserNotFoundException({ $metadata: {} }));

      await expect(plugin.removeUserFromRole(userInfo.uid, roles[0])).rejects.toThrow(
        new UserAlreadyExistsError('User does not exist')
      );
    });

    it('should rethrow an error when the error is unexpected', async () => {
      cognitoMock.on(AdminRemoveUserFromGroupCommand).rejects(new Error());

      await expect(plugin.removeUserFromRole(userInfo.uid, roles[0])).rejects.toThrow(Error);
    });
  });

  describe('createRole tests', () => {
    it('should create the requested group when the group doesnt already exist', async () => {
      const createGroupMock = cognitoMock.on(CreateGroupCommand).resolves({});

      await plugin.createRole(roles[0]);

      expect(createGroupMock.calls().length).toBe(1);
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      cognitoMock.on(CreateGroupCommand).rejects(new InternalErrorException({ $metadata: {} }));

      await expect(plugin.createRole(roles[0])).rejects.toThrow(
        new IdpUnavailableError('Cognito encountered an internal error')
      );
    });

    it('should throw PluginConfigurationError when the plugin is not authorized to perform the action', async () => {
      cognitoMock.on(CreateGroupCommand).rejects(new NotAuthorizedException({ $metadata: {} }));

      await expect(plugin.createRole(roles[0])).rejects.toThrow(
        new PluginConfigurationError('Plugin is not authorized to create a user pool group')
      );
    });

    it('should throw PluginConfigurationError when the user pool id is invalid', async () => {
      cognitoMock.on(CreateGroupCommand).rejects(new ResourceNotFoundException({ $metadata: {} }));

      await expect(plugin.createRole(roles[0])).rejects.toThrow(
        new PluginConfigurationError('Invalid user pool id')
      );
    });

    it('should throw RoleAlreadyExistsError when the user id doesnt exist in the user pool', async () => {
      cognitoMock.on(CreateGroupCommand).rejects(new GroupExistsException({ $metadata: {} }));

      await expect(plugin.createRole(roles[0])).rejects.toThrow(
        new RoleAlreadyExistsError('A group with this name already exists')
      );
    });

    it('should rethrow an error when the error is unexpected', async () => {
      cognitoMock.on(CreateGroupCommand).rejects(new Error());

      await expect(plugin.createRole(roles[0])).rejects.toThrow(Error);
    });
  });

  describe('deleteRole tests', () => {
    it('should delete the requested group when the group exists', async () => {
      const deleteGroupMock = cognitoMock.on(DeleteGroupCommand).resolves({});

      await plugin.deleteRole(roles[0]);

      expect(deleteGroupMock.calls().length).toBe(1);
    });

    it('should throw IdpUnavailableError when Cognito is unavailable', async () => {
      cognitoMock.on(DeleteGroupCommand).rejects(new InternalErrorException({ $metadata: {} }));

      await expect(plugin.deleteRole(roles[0])).rejects.toThrow(
        new IdpUnavailableError('Cognito encountered an internal error')
      );
    });

    it('should throw PluginConfigurationError when the plugin is not authorized to perform the action', async () => {
      cognitoMock.on(DeleteGroupCommand).rejects(new NotAuthorizedException({ $metadata: {} }));

      await expect(plugin.deleteRole(roles[0])).rejects.toThrow(
        new PluginConfigurationError('Plugin is not authorized to delete a user pool group')
      );
    });

    it('should throw PluginConfigurationError when the user pool id is invalid', async () => {
      cognitoMock.on(DeleteGroupCommand).rejects(new ResourceNotFoundException({ $metadata: {} }));

      await expect(plugin.deleteRole(roles[0])).rejects.toThrow(
        new PluginConfigurationError('Invalid user pool id')
      );
    });

    it('should throw RoleNotFoundError when the group doesnt exist in the user pool', async () => {
      cognitoMock
        .on(DeleteGroupCommand)
        .rejects({ name: 'ResourceNotFoundException', message: 'Group not found.' });

      await expect(plugin.deleteRole(roles[0])).rejects.toThrow(new RoleNotFoundError('Role does not exist'));
    });

    it('should rethrow an error when the error is unexpected', async () => {
      cognitoMock.on(DeleteGroupCommand).rejects(new Error());

      await expect(plugin.deleteRole(roles[0])).rejects.toThrow(Error);
    });
  });
});
