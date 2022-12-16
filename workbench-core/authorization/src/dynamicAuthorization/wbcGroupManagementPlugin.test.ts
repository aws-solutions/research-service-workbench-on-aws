/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { UserManagementService, UserManagementPlugin } from '@aws/workbench-core-user-management';
import { AuthenticatedUser } from '../authenticatedUser';
import { WBCGroupManagemntPlugin } from './wbcGroupManagementPlugin';

describe('WBCGroupManagemntPlugin', () => {
  const mockUser: AuthenticatedUser = {
    id: 'sampleId',
    roles: []
  };

  const mockUserManagementPlugin: UserManagementPlugin = {
    getUser: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    activateUser: jest.fn(),
    deactivateUser: jest.fn(),
    listUsers: jest.fn(),
    listUsersForRole: jest.fn(),
    listRoles: jest.fn(),
    addUserToRole: jest.fn(),
    removeUserFromRole: jest.fn(),
    createRole: jest.fn(),
    deleteRole: jest.fn()
  };

  afterEach(jest.resetAllMocks);

  test('Response from addUserToGroup has added equal to true on succesfull call', async () => {
    const userManagementService: UserManagementService = new UserManagementService(mockUserManagementPlugin);
    const wBCGroupManagemntPlugin = new WBCGroupManagemntPlugin(userManagementService);

    const { added } = await wBCGroupManagemntPlugin.addUserToGroup({
      groupId: 'groupId',
      userId: 'userId',
      authenticatedUser: mockUser
    });

    expect(mockUserManagementPlugin.addUserToRole).toBeCalledWith('userId', 'groupId');
    expect(added).toBeTruthy();
  });

  test('Response from addUserToGroup has added equal to false when UserManagementService throws exception', async () => {
    mockUserManagementPlugin.addUserToRole = jest.fn().mockRejectedValue(new Error('Test error'));
    const userManagementService: UserManagementService = new UserManagementService(mockUserManagementPlugin);

    const wBCGroupManagemntPlugin = new WBCGroupManagemntPlugin(userManagementService);

    const { added } = await wBCGroupManagemntPlugin.addUserToGroup({
      groupId: 'groupId',
      userId: 'userId',
      authenticatedUser: mockUser
    });

    expect(mockUserManagementPlugin.addUserToRole).toBeCalledWith('userId', 'groupId');
    expect(added).toBeFalsy();
  });
});
