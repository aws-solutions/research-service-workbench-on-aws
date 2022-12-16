/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../authenticatedUser';
import { DynamicAuthorizationService } from './dynamicAuthorizationService';
import { GroupManagementPlugin } from './groupManagementPlugin';

describe('DynamicAuthorizationService', () => {
  const mockUser: AuthenticatedUser = {
    id: 'sampleId',
    roles: []
  };

  const mockGroupManagementPlugin: GroupManagementPlugin = {
    createGroup: jest.fn(),
    deleteGroup: jest.fn(),
    getUserGroups: jest.fn(),
    getGroupUsers: jest.fn(),
    addUserToGroup: jest.fn(),
    isUserAssignedToGroup: jest.fn(),
    removeUserFromGroup: jest.fn(),
    getGroupStatus: jest.fn(),
    setGroupStatus: jest.fn()
  };

  afterEach(jest.resetAllMocks);

  test.each([
    [{ added: true }, true],
    [{ added: false }, false]
  ])('Request %s to addUserToGroup returns %s', async (response, expected) => {
    mockGroupManagementPlugin.addUserToGroup = jest.fn().mockResolvedValue(response);
    const dynamicAuthorizationService = new DynamicAuthorizationService(mockGroupManagementPlugin);
    const request = {
      groupId: 'groupId',
      userId: 'userId',
      authenticatedUser: mockUser
    };

    const { added } = await dynamicAuthorizationService.addUserToGroup(request);

    expect(mockGroupManagementPlugin.addUserToGroup).toBeCalledWith(request);
    expect(added).toBe(expected);
  });
});
