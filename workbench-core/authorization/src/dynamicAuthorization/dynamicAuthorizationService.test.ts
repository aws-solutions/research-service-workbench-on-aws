/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../authenticatedUser';
import { CreateGroupResponse } from '../models/createGroup';
import { DynamicAuthorizationService } from './dynamicAuthorizationService';
import { GroupManagementPlugin } from './groupManagementPlugin';

describe('WBCGroupManagemntPlugin', () => {
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

  let dynamicAuthzService: DynamicAuthorizationService;

  beforeEach(() => {
    dynamicAuthzService = new DynamicAuthorizationService({
      groupManagementPlugin: mockGroupManagementPlugin
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createGroup', () => {
    it('returns `created` as true when the group was successfully created', async () => {
      const groupId = 'groupId';
      mockGroupManagementPlugin.createGroup = jest.fn().mockResolvedValue({ created: true });
      mockGroupManagementPlugin.setGroupStatus = jest.fn().mockResolvedValue({ statusSet: true });

      const response = await dynamicAuthzService.createGroup({ groupId, authenticatedUser: mockUser });

      expect(response).toMatchObject<CreateGroupResponse>({ created: true });
    });

    it('returns `created` as false when the group is not successfully created', async () => {
      const groupId = 'groupId';
      mockGroupManagementPlugin.createGroup = jest.fn().mockResolvedValue({ created: false });

      const response = await dynamicAuthzService.createGroup({ groupId, authenticatedUser: mockUser });

      expect(response).toMatchObject<CreateGroupResponse>({ created: false });
    });

    it('returns `created` as false when the group status is not successfully set', async () => {
      const groupId = 'groupId';
      mockGroupManagementPlugin.createGroup = jest.fn().mockResolvedValue({ created: true });
      mockGroupManagementPlugin.setGroupStatus = jest.fn().mockResolvedValue({ statusSet: false });
      mockGroupManagementPlugin.deleteGroup = jest.fn().mockResolvedValue({ deleted: true });

      const response = await dynamicAuthzService.createGroup({ groupId, authenticatedUser: mockUser });

      expect(response).toMatchObject<CreateGroupResponse>({ created: false });
    });
  });
});
