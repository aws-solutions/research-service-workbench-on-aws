/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../authenticatedUser';
import { CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import { GetGroupUsersResponse } from './dynamicAuthorizationInputs/getGroupUsers';
import { GetUserGroupsResponse } from './dynamicAuthorizationInputs/getUserGroups';
import { DynamicAuthorizationService } from './dynamicAuthorizationService';
import { GroupManagementPlugin } from './groupManagementPlugin';
import { GroupStatus } from './models/GroupMetadata';

describe('DynamicAuthorizationService', () => {
  let mockUser: AuthenticatedUser;
  let mockGroupManagementPlugin: GroupManagementPlugin;
  let dynamicAuthzService: DynamicAuthorizationService;

  beforeAll(() => {
    mockGroupManagementPlugin = {
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
  });

  beforeEach(() => {
    mockUser = {
      id: 'sampleId',
      roles: []
    };

    dynamicAuthzService = new DynamicAuthorizationService({
      groupManagementPlugin: mockGroupManagementPlugin
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createGroup', () => {
    let groupId: string;
    let status: GroupStatus;

    beforeEach(() => {
      groupId = 'groupId';
      status = 'active';
    });

    it('returns the groupID in the data object when the group was successfully created', async () => {
      mockGroupManagementPlugin.createGroup = jest.fn().mockResolvedValue({ data: { groupId } });
      mockGroupManagementPlugin.setGroupStatus = jest.fn().mockResolvedValue({ data: { status } });

      const response = await dynamicAuthzService.createGroup({ groupId, authenticatedUser: mockUser });

      expect(response).toMatchObject<CreateGroupResponse>({ data: { groupId } });
    });

    it('throws when the group is not successfully created', async () => {
      mockGroupManagementPlugin.createGroup = jest.fn().mockRejectedValue(new Error());

      await expect(dynamicAuthzService.createGroup({ groupId, authenticatedUser: mockUser })).rejects.toThrow(
        Error
      );
    });

    it('throws when the group status is not successfully set', async () => {
      mockGroupManagementPlugin.setGroupStatus = jest.fn().mockRejectedValue(new Error());

      await expect(dynamicAuthzService.createGroup({ groupId, authenticatedUser: mockUser })).rejects.toThrow(
        Error
      );
    });
  });

  describe('getUserGroups', () => {
    let userId: string;
    let groupIds: string[];

    beforeEach(() => {
      userId = 'userId';
      groupIds = ['123', '456', '789'];
    });

    it('returns an array of groupID in the data object that the requested user is in', async () => {
      mockGroupManagementPlugin.getUserGroups = jest.fn().mockResolvedValue({ data: { groupIds } });

      const response = await dynamicAuthzService.getUserGroups({ userId, authenticatedUser: mockUser });

      expect(response).toMatchObject<GetUserGroupsResponse>({ data: { groupIds } });
    });

    it('throws when the user cannot be found', async () => {
      mockGroupManagementPlugin.getUserGroups = jest.fn().mockRejectedValue(new Error());

      await expect(
        dynamicAuthzService.getUserGroups({ userId, authenticatedUser: mockUser })
      ).rejects.toThrow(Error);
    });
  });
  describe('addUserToGroup', () => {
    it('returns userID and groupID when user was successfully added to group', async () => {
      mockGroupManagementPlugin.addUserToGroup = jest
        .fn()
        .mockResolvedValue({ data: { userId: 'userId', groupId: 'groupId' } });

      const request = {
        groupId: 'groupId',
        userId: 'userId',
        authenticatedUser: mockUser
      };

      const { data } = await dynamicAuthzService.addUserToGroup(request);

      expect(mockGroupManagementPlugin.addUserToGroup).toBeCalledWith(request);
      expect(data).toStrictEqual({ userId: 'userId', groupId: 'groupId' });
    });
  });

  describe('getGroupUsers', () => {
    let groupId: string;
    let userIds: string[];

    beforeEach(() => {
      groupId = 'userId';
      userIds = ['123', '456', '789'];
    });

    it('returns an array of groupID in the data object that the requested user is in', async () => {
      mockGroupManagementPlugin.getGroupUsers = jest.fn().mockResolvedValue({ data: { userIds } });

      const response = await dynamicAuthzService.getGroupUsers({ groupId, authenticatedUser: mockUser });

      expect(response).toMatchObject<GetGroupUsersResponse>({ data: { userIds } });
    });

    it('throws when the user cannot be found', async () => {
      mockGroupManagementPlugin.getGroupUsers = jest.fn().mockRejectedValue(new Error());

      await expect(
        dynamicAuthzService.getGroupUsers({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(Error);
    });
  });
});
