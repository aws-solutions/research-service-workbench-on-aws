/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Status, User } from './user';
import { UserManagementPlugin } from './userManagementPlugin';
import { UserManagementService } from './userManagementService';

describe('User Management Service', () => {
  const mockUid: string = 'sampleUid';
  const mockRole: string = 'sampleRole';
  const mockUser: User = {
    uid: mockUid,
    firstName: 'sampleFirstName',
    lastName: 'sampleLastName',
    email: 'sampleEmail',
    status: Status.ACTIVE,
    roles: [mockRole]
  };

  const mockUserManagementPlugin: UserManagementPlugin = {
    getUser: jest.fn().mockImplementation(() => mockUser),
    createUser: jest.fn().mockImplementation(() => {}),
    updateUser: jest.fn().mockImplementation(() => {}),
    deleteUser: jest.fn().mockImplementation(() => {}),
    activateUser: jest.fn().mockImplementation(() => {}),
    deactivateUser: jest.fn().mockImplementation(() => {}),
    listUsers: jest.fn().mockImplementation(() => [mockUid]),
    listUsersForRole: jest.fn().mockImplementation(() => [mockUid]),
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
    const user = await userManagementService.getUser(mockUid);
    expect(user).toEqual(mockUser);
  });

  test('createUser', async () => {
    await expect(userManagementService.createUser(mockUser)).resolves.not.toThrow();
  });

  test('updateUser', async () => {
    await expect(userManagementService.updateUser(mockUid, mockUser)).resolves.not.toThrow();
  });

  test('deleteUser', async () => {
    await expect(userManagementService.deleteUser(mockUid)).resolves.not.toThrow();
  });

  test('activateUser', async () => {
    await userManagementService.activateUser(mockUid);
    expect(mockUserManagementPlugin.activateUser).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.activateUser).toBeCalledWith(mockUid);
  });

  test('deactivateUser', async () => {
    await userManagementService.deactivateUser(mockUid);
    expect(mockUserManagementPlugin.deactivateUser).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.deactivateUser).toBeCalledWith(mockUid);
  });

  test('listUsers', async () => {
    const users = await userManagementService.listUsers();
    expect(users).toEqual([mockUid]);
  });

  test('listUsersForRole', async () => {
    const users = await userManagementService.listUsersForRole(mockRole);
    expect(users).toEqual([mockUid]);
  });

  test('listRoles', async () => {
    const roles = await userManagementService.listRoles();
    expect(roles).toEqual([mockRole]);
  });

  test('addUserToRole', async () => {
    await expect(userManagementService.addUserToRole(mockUid, mockRole)).resolves.not.toThrow();
  });

  test('removeUserFromRole', async () => {
    await expect(userManagementService.removeUserFromRole(mockUid, mockRole)).resolves.not.toThrow();
  });

  test('createRole', async () => {
    await expect(userManagementService.createRole(mockRole)).resolves.not.toThrow();
  });

  test('deleteRole', async () => {
    await expect(userManagementService.deleteRole(mockRole)).resolves.not.toThrow();
  });
});
