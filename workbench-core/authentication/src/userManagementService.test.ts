/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { User } from './user';
import { UserManagementPlugin } from './userManagementPlugin';
import { UserManagementService } from './userManagementService';

describe('User Management Service', () => {
  const mockUserManagementPlugin: UserManagementPlugin = {
    getUser: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    listUsers: jest.fn(),
    listUsersForRole: jest.fn(),
    listRoles: jest.fn(),
    addUserToRole: jest.fn(),
    removeUserFromRole: jest.fn(),
    createRole: jest.fn(),
    deleteRole: jest.fn()
  };
  const userManagementService: UserManagementService = new UserManagementService(mockUserManagementPlugin);
  const mockUid: string = 'sampleUid';
  const mockRole: string = 'sampleRole';
  const mockUser: User = {
    uid: mockUid,
    firstName: 'sampleFirstName',
    lastName: 'sampleLastName',
    email: 'sampleEmail',
    roles: [mockRole]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUser', async () => {
    await userManagementService.getUser(mockUid);
    expect(mockUserManagementPlugin.getUser).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.getUser).toBeCalledWith(mockUid);
  });

  test('createUser', async () => {
    await userManagementService.createUser(mockUser);
    expect(mockUserManagementPlugin.createUser).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.createUser).toBeCalledWith(mockUser);
  });

  test('updateUser', async () => {
    await userManagementService.updateUser(mockUid, mockUser);
    expect(mockUserManagementPlugin.updateUser).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.updateUser).toBeCalledWith(mockUid, mockUser);
  });

  test('deleteUser', async () => {
    await userManagementService.deleteUser(mockUid);
    expect(mockUserManagementPlugin.deleteUser).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.deleteUser).toBeCalledWith(mockUid);
  });

  test('listUsers', async () => {
    await userManagementService.listUsers();
    expect(mockUserManagementPlugin.listUsers).toBeCalledTimes(1);
  });

  test('listUsersForRole', async () => {
    await userManagementService.listUsersForRole(mockRole);
    expect(mockUserManagementPlugin.listUsersForRole).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.listUsersForRole).toBeCalledWith(mockRole);
  });

  test('listRoles', async () => {
    await userManagementService.listRoles();
    expect(mockUserManagementPlugin.listRoles).toBeCalledTimes(1);
  });

  test('addUserToRole', async () => {
    await userManagementService.addUserToRole(mockUid, mockRole);
    expect(mockUserManagementPlugin.addUserToRole).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.addUserToRole).toBeCalledWith(mockUid, mockRole);
  });

  test('removeUserFromRole', async () => {
    await userManagementService.removeUserFromRole(mockUid, mockRole);
    expect(mockUserManagementPlugin.removeUserFromRole).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.removeUserFromRole).toBeCalledWith(mockUid, mockRole);
  });

  test('createRole', async () => {
    await userManagementService.createRole(mockRole);
    expect(mockUserManagementPlugin.createRole).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.createRole).toBeCalledWith(mockRole);
  });

  test('deleteRole', async () => {
    await userManagementService.deleteRole(mockRole);
    expect(mockUserManagementPlugin.deleteRole).toBeCalledTimes(1);
    expect(mockUserManagementPlugin.deleteRole).toBeCalledWith(mockRole);
  });
});
