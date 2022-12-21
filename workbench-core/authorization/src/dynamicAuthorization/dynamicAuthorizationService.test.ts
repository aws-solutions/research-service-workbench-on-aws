/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../authenticatedUser';
import { CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import { DynamicAuthorizationService } from './dynamicAuthorizationService';
import { GroupManagementPlugin } from './groupManagementPlugin';
import { GroupStatus } from './models/GroupMetadata';

describe('WBCGroupManagemntPlugin', () => {
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
});
