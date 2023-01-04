/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditPlugin, AuditService, BaseAuditPlugin, Writer } from '@aws/workbench-core-audit';
import { JSONValue } from '@aws/workbench-core-base';
import { Action } from '../action';
import { AuthenticatedUser } from '../authenticatedUser';
import { Effect } from '../effect';
import { GroupAlreadyExistsError } from '../errors/groupAlreadyExistsError';
import { GroupNotFoundError } from '../errors/groupNotFoundError';
import { ThroughputExceededError } from '../errors/throughputExceededError';
import { CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import { GetGroupUsersResponse } from './dynamicAuthorizationInputs/getGroupUsers';
import { GetUserGroupsResponse } from './dynamicAuthorizationInputs/getUserGroups';
import { IdentityPermission, IdentityType } from './dynamicAuthorizationInputs/identityPermission';
import { DynamicAuthorizationPermissionsPlugin } from './dynamicAuthorizationPermissionsPlugin';
import { DynamicAuthorizationService } from './dynamicAuthorizationService';
import { GroupManagementPlugin } from './groupManagementPlugin';
import { GroupStatus } from './models/GroupMetadata';

describe('DynamicAuthorizationService', () => {
  let groupId: string;
  let userId: string;
  let status: GroupStatus;
  let auditService: AuditService;
  let auditPlugin: AuditPlugin;
  let mockAuditWriter: Writer;
  let mockUser: AuthenticatedUser;

  let mockGroupManagementPlugin: GroupManagementPlugin;
  let mockDynamicAuthorizationPermissionsPlugin: DynamicAuthorizationPermissionsPlugin;
  let dynamicAuthzService: DynamicAuthorizationService;

  let auditServiceWriteSpy: jest.SpyInstance;
  let actor: object;
  let source: object;
  let action: string;

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

    mockDynamicAuthorizationPermissionsPlugin = {
      isRouteIgnored: jest.fn(),
      isRouteProtected: jest.fn(),
      getDynamicOperationsByRoute: jest.fn(),
      createIdentityPermissions: jest.fn(),
      deleteIdentityPermissions: jest.fn(),
      getIdentityPermissionsByIdentity: jest.fn(),
      getIdentityPermissionsBySubject: jest.fn()
    };
    mockAuditWriter = {
      write: jest.fn()
    };
    auditPlugin = new BaseAuditPlugin(mockAuditWriter);

    auditService = new AuditService(auditPlugin);
    auditServiceWriteSpy = jest.spyOn(auditService, 'write');

    actor = mockUser;
    source = {
      serviceName: 'DynamicAuthorizationService'
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
      groupManagementPlugin: mockGroupManagementPlugin,
      dynamicAuthorizationPermissionsPlugin: mockDynamicAuthorizationPermissionsPlugin,
      auditService
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
      mockGroupManagementPlugin.createGroup = jest.fn().mockRejectedValue(new GroupAlreadyExistsError());

      await expect(dynamicAuthzService.createGroup({ groupId, authenticatedUser: mockUser })).rejects.toThrow(
        GroupAlreadyExistsError
      );
    });

    it('throws when the group status is not successfully set', async () => {
      mockGroupManagementPlugin.setGroupStatus = jest.fn().mockRejectedValue(new GroupNotFoundError());

      await expect(dynamicAuthzService.createGroup({ groupId, authenticatedUser: mockUser })).rejects.toThrow(
        GroupNotFoundError
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
      mockGroupManagementPlugin.getUserGroups = jest.fn().mockRejectedValue(new GroupNotFoundError());

      await expect(
        dynamicAuthzService.getUserGroups({ userId, authenticatedUser: mockUser })
      ).rejects.toThrow(GroupNotFoundError);
    });
  });

  describe('createIdentityPermissions', () => {
    let sampleGroupId: string;
    let sampleGroupType: IdentityType;

    let sampleAction: Action;
    let sampleEffect: Effect;
    let sampleSubjectType: string;
    let sampleSubjectId: string;
    let sampleConditions: Record<string, JSONValue>;
    let sampleFields: string[];
    let sampleDescription: string;

    let mockIdentityPermission: IdentityPermission;

    let mockIdentityPermissions: IdentityPermission[];

    beforeEach(() => {
      sampleGroupId = 'sampleGroup';
      sampleGroupType = 'GROUP';
      sampleAction = 'CREATE';
      sampleEffect = 'ALLOW';
      sampleSubjectType = 'sampleSubjectType';
      sampleSubjectId = 'sampleSubjectId';
      sampleConditions = {};
      sampleFields = [];
      sampleDescription = 'sampleDescription';
      mockIdentityPermission = {
        action: sampleAction,
        effect: sampleEffect,
        subjectType: sampleSubjectType,
        subjectId: sampleSubjectId,
        identityId: sampleGroupId,
        identityType: sampleGroupType,
        conditions: sampleConditions,
        fields: sampleFields,
        description: sampleDescription
      };

      mockIdentityPermissions = [mockIdentityPermission, mockIdentityPermission];

      action = 'createIdentityPermissions';
      actor = mockUser;
      source = {
        serviceName: 'DynamicAuthorizationService'
      };
    });

    test('create identity permissions for valid groups', async () => {
      mockGroupManagementPlugin.getGroupStatus = jest.fn().mockResolvedValue({ data: { status: 'active' } });
      const mockReturnValue = {
        data: {
          identityPermissions: mockIdentityPermissions
        }
      };
      mockDynamicAuthorizationPermissionsPlugin.createIdentityPermissions = jest
        .fn()
        .mockResolvedValue(mockReturnValue);
      const params = {
        authenticatedUser: mockUser,
        identityPermissions: mockIdentityPermissions
      };
      const result = await dynamicAuthzService.createIdentityPermissions(params);

      expect(result.data).toStrictEqual({
        identityPermissions: mockIdentityPermissions
      });

      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor,
          source,
          action,
          requestBody: params,
          statusCode: 200
        },
        mockReturnValue
      );
    });

    test('create identity permissions for invalid group', async () => {
      mockGroupManagementPlugin.getGroupStatus = jest
        .fn()
        .mockResolvedValueOnce({ data: { status: 'active' } });
      mockGroupManagementPlugin.getGroupStatus = jest
        .fn()
        .mockResolvedValueOnce({ data: { status: 'pending_delete' } });

      const params = {
        authenticatedUser: mockUser,
        identityPermissions: mockIdentityPermissions
      };
      await expect(dynamicAuthzService.createIdentityPermissions(params)).rejects.toThrow(GroupNotFoundError);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor,
          source,
          action,
          requestBody: params,
          statusCode: 400
        },
        new GroupNotFoundError('One or more groups are not found')
      );
    });
    test('create identity permissions for invalid group', async () => {
      mockGroupManagementPlugin.getGroupStatus = jest
        .fn()
        .mockRejectedValueOnce(new GroupNotFoundError('Invalid group'));

      const params = {
        authenticatedUser: mockUser,
        identityPermissions: mockIdentityPermissions
      };
      await expect(dynamicAuthzService.createIdentityPermissions(params)).rejects.toThrow(GroupNotFoundError);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor,
          source,
          action,
          requestBody: params,
          statusCode: 400
        },
        new GroupNotFoundError('Invalid group')
      );
    });

    test('exceed create identity permissions limit of 100', async () => {
      const exceededMockIdentityPermissions = Array(101).fill(mockIdentityPermission);
      const params = {
        authenticatedUser: mockUser,
        identityPermissions: exceededMockIdentityPermissions
      };
      await expect(dynamicAuthzService.createIdentityPermissions(params)).rejects.toThrow(
        ThroughputExceededError
      );

      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor,
          source,
          action,
          requestBody: params,
          statusCode: 400
        },
        new ThroughputExceededError('Exceeds 100 identity permissions')
      );
    });
  });

  describe('addUserToGroup', () => {
    beforeAll(() => {
      action = 'addUserToGroup';
    });

    afterEach(jest.resetAllMocks);

    it('returns userID and groupID when user was successfully added to group', async () => {
      const mockReturnValue = { data: { userId, groupId } };
      mockGroupManagementPlugin.addUserToGroup = jest.fn().mockResolvedValue(mockReturnValue);

      const requestBody = {
        userId,
        groupId,
        authenticatedUser: mockUser
      };

      const { data } = await dynamicAuthzService.addUserToGroup(requestBody);

      expect(mockGroupManagementPlugin.addUserToGroup).toBeCalledWith(requestBody);
      expect(data).toStrictEqual(mockReturnValue.data);

      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor,
          source,
          action,
          requestBody,
          statusCode: 200
        },
        mockReturnValue
      );
    });

    it('throws and writes to audit service when user cannnot be added to group', async () => {
      mockGroupManagementPlugin.addUserToGroup = jest
        .fn()
        .mockRejectedValue(new GroupNotFoundError('Group does not exist.'));

      const requestBody = {
        groupId,
        userId,
        authenticatedUser: mockUser
      };

      await expect(dynamicAuthzService.addUserToGroup(requestBody)).rejects.toThrow(GroupNotFoundError);
      expect(mockGroupManagementPlugin.addUserToGroup).toBeCalledWith(requestBody);

      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor,
          source,
          action,
          requestBody,
          statusCode: 400
        },
        new GroupNotFoundError('Group does not exist.')
      );
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
      mockGroupManagementPlugin.removeUserFromGroup = jest.fn().mockRejectedValue(new GroupNotFoundError());

      await expect(
        dynamicAuthzService.removeUserFromGroup({ groupId, userId, authenticatedUser: mockUser })
      ).rejects.toThrow(GroupNotFoundError);
    });
  });

  describe('getGroupUsers', () => {
    let groupId: string;
    let userIds: string[];

    beforeEach(() => {
      groupId = 'userId';
      userIds = ['123', '456', '789'];
    });

    it('returns an array of userID in the data object for the requested group', async () => {
      mockGroupManagementPlugin.getGroupUsers = jest.fn().mockResolvedValue({ data: { userIds } });

      const response = await dynamicAuthzService.getGroupUsers({ groupId, authenticatedUser: mockUser });

      expect(response).toMatchObject<GetGroupUsersResponse>({ data: { userIds } });
    });

    it('throws when the group cannot be found', async () => {
      mockGroupManagementPlugin.getGroupUsers = jest.fn().mockRejectedValue(new GroupNotFoundError());

      await expect(
        dynamicAuthzService.getGroupUsers({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(GroupNotFoundError);
    });
  });
});
