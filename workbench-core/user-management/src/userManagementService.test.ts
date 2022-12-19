/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Status, User } from './user';
import { UserManagementPlugin } from './userManagementPlugin';
import { UserManagementService } from './userManagementService';

describe('User Management Service', () => {
  const mockId: string = 'sampleUid';
  const mockRole: string = 'sampleRole';
  const mockUser: User = {
    id: mockId,
    firstName: 'sampleFirstName',
    lastName: 'sampleLastName',
    email: 'sampleEmail',
    status: Status.ACTIVE,
    roles: [mockRole]
  };

  const mockUserManagementPlugin: UserManagementPlugin = {
    getUser: jest.fn().mockImplementation(() => mockUser),
    createUser: jest.fn().mockImplementation(() => mockUser),
    updateUser: jest.fn().mockImplementation(() => {}),
    deleteUser: jest.fn().mockImplementation(() => {}),
    activateUser: jest.fn().mockImplementation(() => {}),
    deactivateUser: jest.fn().mockImplementation(() => {}),
    listUsers: jest.fn().mockImplementation(() => [mockId]),
    listUsersForRole: jest.fn().mockImplementation(() => [mockId]),
    listRoles: jest.fn().mockImplementation(() => [mockRole]),
    addUserToRole: jest.fn().mockImplementation(() => {}),
    removeUserFromRole: jest.fn().mockImplementation(() => {}),
    createRole: jest.fn().mockImplementation(() => {}),
    deleteRole: jest.fn().mockImplementation(() => {})
  };
  const userManagementService: UserManagementService = new UserManagementService(mockUserManagementPlugin);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUser', async () => {
    const user = await userManagementService.getUser(mockId);
    expect(user).toEqual(mockUser);
  });

  test('createUser', async () => {
    const user = await userManagementService.createUser(mockUser);
    expect(user).toEqual(mockUser);
  });

  test('updateUser', async () => {
    await expect(userManagementService.updateUser(mockId, mockUser)).resolves.not.toThrow();
  });

  test('deleteUser', async () => {
    await expect(userManagementService.deleteUser(mockId)).resolves.not.toThrow();
  });

  test('activateUser', async () => {
    await userManagementService.activateUser(mockId);
    expect(mockUserManagementPlugin.activateUser).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.activateUser).toBeCalledWith(mockId);
  });

  test('deactivateUser', async () => {
    await userManagementService.deactivateUser(mockId);
    expect(mockUserManagementPlugin.deactivateUser).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.deactivateUser).toBeCalledWith(mockId);
  });

  test('listUsers', async () => {
    const users = await userManagementService.listUsers();
    expect(users).toEqual([mockId]);
  });

  test('listUsersForRole', async () => {
    const users = await userManagementService.listUsersForRole(mockRole);
    expect(users).toEqual([mockId]);
  });

  test('listRoles', async () => {
    const roles = await userManagementService.listRoles();
    expect(roles).toEqual([mockRole]);
  });

  test('addUserToRole', async () => {
    await expect(userManagementService.addUserToRole(mockId, mockRole)).resolves.not.toThrow();
  });

  test('removeUserFromRole', async () => {
    await expect(userManagementService.removeUserFromRole(mockId, mockRole)).resolves.not.toThrow();
  });

  test('createRole', async () => {
    await expect(userManagementService.createRole(mockRole)).resolves.not.toThrow();
  });

  test('deleteRole', async () => {
    await expect(userManagementService.deleteRole(mockRole)).resolves.not.toThrow();
  });
});
