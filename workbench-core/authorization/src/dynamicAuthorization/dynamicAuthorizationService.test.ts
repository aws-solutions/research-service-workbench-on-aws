/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../authenticatedUser';
import { CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import { GetUserGroupsResponse } from './dynamicAuthorizationInputs/getUserGroups';
import { DynamicAuthorizationService } from './dynamicAuthorizationService';
import { GroupManagementPlugin } from './groupManagementPlugin';
import { GroupStatus } from './models/GroupMetadata';

describe('DynamicAuthorizationService', () => {
  let groupId: string;
  let userId: string;
  let status: GroupStatus;
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
    groupId = 'groupId';
    userId = 'userId';
    status = 'active';
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
    it('returns an array of groupID in the data object that the requested user is in', async () => {
      mockGroupManagementPlugin.getUserGroups = jest
        .fn()
        .mockResolvedValue({ data: { groupIds: [groupId] } });

      const response = await dynamicAuthzService.getUserGroups({ userId, authenticatedUser: mockUser });

      expect(response).toMatchObject<GetUserGroupsResponse>({ data: { groupIds: [groupId] } });
    });

    it('throws when the user cannot be found', async () => {
      mockGroupManagementPlugin.getUserGroups = jest.fn().mockRejectedValue(new Error());

      await expect(
        dynamicAuthzService.getUserGroups({ userId, authenticatedUser: mockUser })
      ).rejects.toThrow(Error);
    });
  });

  describe('addUserToGroup', () => {
    it('returns userID and groupID when user was successfully added to the group', async () => {
      mockGroupManagementPlugin.addUserToGroup = jest.fn().mockResolvedValue({ data: { userId, groupId } });

      const { data } = await dynamicAuthzService.addUserToGroup({
        groupId,
        userId,
        authenticatedUser: mockUser
      });

      expect(data).toStrictEqual({ userId, groupId });
    });

    it('throws when the user cannot be added', async () => {
      mockGroupManagementPlugin.addUserToGroup = jest.fn().mockRejectedValue(new Error());

      await expect(
        dynamicAuthzService.addUserToGroup({ groupId, userId, authenticatedUser: mockUser })
      ).rejects.toThrow(Error);
    });
  });

  describe('removeUserFromGroup', () => {
    it('returns userID and groupID when user was successfully removed from the group', async () => {
      mockGroupManagementPlugin.removeUserFromGroup = jest
        .fn()
        .mockResolvedValue({ data: { userId, groupId } });

      const { data } = await dynamicAuthzService.removeUserFromGroup({
        groupId,
        userId,
        authenticatedUser: mockUser
      });

      expect(data).toStrictEqual({ userId: 'userId', groupId: 'groupId' });
    });

    it('throws when the user cannot be removed', async () => {
      mockGroupManagementPlugin.removeUserFromGroup = jest.fn().mockRejectedValue(new Error());

      await expect(
        dynamicAuthzService.removeUserFromGroup({ groupId, userId, authenticatedUser: mockUser })
      ).rejects.toThrow(Error);
    });
  });
});
