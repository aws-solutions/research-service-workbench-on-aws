/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ListUsersForRoleRequestParser } from '@aws/workbench-core-base';
import { Status, User } from './user';
import { UserManagementPlugin } from './userManagementPlugin';
import { UserManagementService } from './userManagementService';

describe('User Management Service', () => {
  let mockUser: User;

  let mockUserManagementPlugin: UserManagementPlugin;
  let userManagementService: UserManagementService;

  beforeAll(() => {
    mockUserManagementPlugin = {
      getUser: jest.fn().mockImplementation(() => mockUser),
      getUserRoles: jest.fn().mockImplementation(() => mockUser.roles),
      createUser: jest.fn().mockImplementation(() => mockUser),
      updateUser: jest.fn().mockImplementation(() => {}),
      deleteUser: jest.fn().mockImplementation(() => {}),
      activateUser: jest.fn().mockImplementation(() => {}),
      deactivateUser: jest.fn().mockImplementation(() => {}),
      listUsers: jest.fn().mockImplementation(() => [mockUser.id]),
      listUsersForRole: jest.fn().mockImplementation(() => {
        return { data: [mockUser.id] };
      }),
      listRoles: jest.fn().mockImplementation(() => [mockUser.roles]),
      addUserToRole: jest.fn().mockImplementation(() => {}),
      removeUserFromRole: jest.fn().mockImplementation(() => {}),
      createRole: jest.fn().mockImplementation(() => {}),
      deleteRole: jest.fn().mockImplementation(() => {}),
      validateUserRoles: jest.fn().mockImplementation(() => mockUser.roles)
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    userManagementService = new UserManagementService(mockUserManagementPlugin);
    mockUser = {
      id: 'sampleUid',
      firstName: 'sampleFirstName',
      lastName: 'sampleLastName',
      email: 'sampleEmail',
      status: Status.ACTIVE,
      roles: ['Researcher']
    };
  });

  test('getUser', async () => {
    const user = await userManagementService.getUser(mockUser.id);
    expect(user).toEqual(mockUser);
  });

  test('getUserRoles', async () => {
    const roles = await userManagementService.getUserRoles(mockUser.id);
    expect(roles).toEqual(mockUser.roles);
  });

  test('createUser', async () => {
    const user = await userManagementService.createUser(mockUser);
    expect(user).toEqual(mockUser);
  });

  test('updateUser', async () => {
    await expect(userManagementService.updateUser(mockUser.id, mockUser)).resolves.not.toThrow();
  });

  test('deleteUser', async () => {
    await expect(userManagementService.deleteUser(mockUser.id)).resolves.not.toThrow();
  });

  test('activateUser', async () => {
    await userManagementService.activateUser(mockUser.id);
    expect(mockUserManagementPlugin.activateUser).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.activateUser).toBeCalledWith(mockUser.id);
  });

  test('deactivateUser', async () => {
    await userManagementService.deactivateUser(mockUser.id);
    expect(mockUserManagementPlugin.deactivateUser).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.deactivateUser).toBeCalledWith(mockUser.id);
  });

  test('listUsers', async () => {
    const users = await userManagementService.listUsers({});
    expect(users).toEqual([mockUser.id]);
  });

  test('listUsersForRole', async () => {
    const request = ListUsersForRoleRequestParser.parse({
      role: mockUser.roles[0],
      projectId: 'fakeProjectId'
    });
    const response = await userManagementService.listUsersForRole(request);
    expect(response.data).toEqual([mockUser.id]);
  });

  test('listRoles', async () => {
    const roles = await userManagementService.listRoles();
    expect(roles).toEqual([mockUser.roles]);
  });

  test('addUserToRole', async () => {
    await expect(userManagementService.addUserToRole(mockUser.id, mockUser.roles[0])).resolves.not.toThrow();
  });

  test('removeUserFromRole', async () => {
    await expect(
      userManagementService.removeUserFromRole(mockUser.id, mockUser.roles[0])
    ).resolves.not.toThrow();
  });

  test('createRole', async () => {
    await expect(userManagementService.createRole(mockUser.roles[0])).resolves.not.toThrow();
  });

  test('deleteRole', async () => {
    await expect(userManagementService.deleteRole(mockUser.roles[0])).resolves.not.toThrow();
  });

  test('validateUserRoles', async () => {
    const roles = await userManagementService.validateUserRoles(mockUser.id, mockUser.roles);
    expect(roles).toStrictEqual(mockUser.roles);
  });
});
