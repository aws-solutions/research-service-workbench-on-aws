/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin } from '@aws/workbench-core-audit';
import { JSONValue } from '@aws/workbench-core-base';
import { UserNotFoundError } from '@aws/workbench-core-user-management';
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
import { IsUserAssignedToGroupResponse } from './dynamicAuthorizationInputs/isUserAssignedToGroup';
import { RemoveUserFromGroupResponse } from './dynamicAuthorizationInputs/removeUserFromGroup';
import { DynamicAuthorizationPermissionsPlugin } from './dynamicAuthorizationPermissionsPlugin';
import { DynamicAuthorizationService } from './dynamicAuthorizationService';
import { GroupManagementPlugin } from './groupManagementPlugin';

describe('DynamicAuthorizationService', () => {
  let groupId: string;
  let userId: string;
  let mockUser: AuthenticatedUser;

  let auditSource: object;
  let auditAction: string;
  let auditServiceWriteSpy: jest.SpyInstance;

  let auditService: AuditService;
  let mockGroupManagementPlugin: GroupManagementPlugin;
  let mockDynamicAuthorizationPermissionsPlugin: DynamicAuthorizationPermissionsPlugin;
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

    mockDynamicAuthorizationPermissionsPlugin = {
      isRouteIgnored: jest.fn(),
      isRouteProtected: jest.fn(),
      getDynamicOperationsByRoute: jest.fn(),
      createIdentityPermissions: jest.fn(),
      deleteIdentityPermissions: jest.fn(),
      getIdentityPermissionsByIdentity: jest.fn(),
      getIdentityPermissionsBySubject: jest.fn()
    };

    auditService = new AuditService(
      new BaseAuditPlugin({
        write: jest.fn()
      })
    );

    auditServiceWriteSpy = jest.spyOn(auditService, 'write');
  });

  beforeEach(() => {
    groupId = 'groupId';
    userId = 'userId';
    mockUser = {
      id: 'sampleId',
      roles: []
    };

    auditSource = {
      serviceName: DynamicAuthorizationService.name
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

  describe('init', () => {
    it('throws a not implemented exception', async () => {
      await expect(dynamicAuthzService.init({})).rejects.toThrow(Error);
    });
  });

  describe('isAuthorizedOnSubject', () => {
    it('throws a not implemented exception', async () => {
      await expect(
        dynamicAuthzService.isAuthorizedOnSubject({
          user: mockUser,
          dynamicOperation: { action: 'CREATE', subjectId: '', subjectType: '' }
        })
      ).rejects.toThrow(Error);
    });
  });

  describe('isRouteIgnored', () => {
    it('throws a not implemented exception', async () => {
      await expect(dynamicAuthzService.isRouteIgnored({ route: '', method: 'GET' })).rejects.toThrow(Error);
    });
  });

  describe('isRouteProtected', () => {
    it('throws a not implemented exception', async () => {
      await expect(dynamicAuthzService.isRouteProtected({ route: '', method: 'GET' })).rejects.toThrow(Error);
    });
  });

  describe('isAuthorizedOnRoute', () => {
    it('throws a not implemented exception', async () => {
      await expect(
        dynamicAuthzService.isAuthorizedOnRoute({ authenticatedUser: mockUser, route: '', method: 'GET' })
      ).rejects.toThrow(Error);
    });
  });

  describe('createGroup', () => {
    beforeEach(() => {
      auditAction = 'createGroup';
    });

    it('returns the groupID in the data object when the group was successfully created', async () => {
      const mockReturnValue = { data: { groupId } };
      mockGroupManagementPlugin.createGroup = jest.fn().mockResolvedValue(mockReturnValue);

      const params = { groupId, authenticatedUser: mockUser };

      const response = await dynamicAuthzService.createGroup(params);

      expect(response).toMatchObject<CreateGroupResponse>(mockReturnValue);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 200
        },
        mockReturnValue
      );
    });

    it('throws when the group is not successfully created', async () => {
      const mockReturnValue = new GroupAlreadyExistsError();
      mockGroupManagementPlugin.createGroup = jest.fn().mockRejectedValue(mockReturnValue);

      const params = { groupId, authenticatedUser: mockUser };

      await expect(dynamicAuthzService.createGroup(params)).rejects.toThrow(GroupAlreadyExistsError);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 400
        },
        mockReturnValue
      );
    });
  });

  describe('deleteGroup', () => {
    it('throws a not implemented exception', async () => {
      await expect(dynamicAuthzService.deleteGroup({ groupId, authenticatedUser: mockUser })).rejects.toThrow(
        Error
      );
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

      auditAction = 'createIdentityPermissions';
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
          actor: mockUser,
          source: auditSource,
          action: auditAction,
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
          actor: mockUser,
          source: auditSource,
          action: auditAction,
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
          actor: mockUser,
          source: auditSource,
          action: auditAction,
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
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 400
        },
        new ThroughputExceededError('Exceeds 100 identity permissions')
      );
    });
  });

  describe('deleteIdentityPermissions', () => {
    it('throws a not implemented exception', async () => {
      await expect(
        dynamicAuthzService.deleteIdentityPermissions({
          identityPermissions: [],
          authenticatedUser: mockUser
        })
      ).rejects.toThrow(Error);
    });
  });

  describe('getIdentityPermissionsBySubject', () => {
    it('throws a not implemented exception', async () => {
      await expect(
        dynamicAuthzService.getIdentityPermissionsBySubject({
          subjectType: '',
          subjectId: '',
          authenticatedUser: mockUser
        })
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
      mockGroupManagementPlugin.addUserToGroup = jest.fn().mockRejectedValue(new GroupNotFoundError());

      await expect(
        dynamicAuthzService.addUserToGroup({ groupId, userId, authenticatedUser: mockUser })
      ).rejects.toThrow(GroupNotFoundError);
    });
  });

  describe('removeUserFromGroup', () => {
    beforeEach(() => {
      auditAction = 'removeUserFromGroup';
    });

    it('returns userID and groupID when user was successfully removed from the group', async () => {
      const mockReturnValue = { data: { userId, groupId } };
      mockGroupManagementPlugin.removeUserFromGroup = jest.fn().mockResolvedValue(mockReturnValue);

      const params = { groupId, userId, authenticatedUser: mockUser };

      const response = await dynamicAuthzService.removeUserFromGroup(params);

      expect(response).toMatchObject<RemoveUserFromGroupResponse>(mockReturnValue);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 200
        },
        mockReturnValue
      );
    });

    it('throws when the user cannot be removed', async () => {
      const mockReturnValue = new GroupNotFoundError();
      mockGroupManagementPlugin.removeUserFromGroup = jest.fn().mockRejectedValue(mockReturnValue);

      const params = { groupId, userId, authenticatedUser: mockUser };

      await expect(dynamicAuthzService.removeUserFromGroup(params)).rejects.toThrow(GroupNotFoundError);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 400
        },
        mockReturnValue
      );
    });
  });

  describe('getGroupUsers', () => {
    it('returns an array of userID in the data object for the requested group', async () => {
      mockGroupManagementPlugin.getGroupUsers = jest.fn().mockResolvedValue({ data: { userIds: [userId] } });

      const response = await dynamicAuthzService.getGroupUsers({ groupId, authenticatedUser: mockUser });

      expect(response).toMatchObject<GetGroupUsersResponse>({ data: { userIds: [userId] } });
    });

    it('throws when the group cannot be found', async () => {
      mockGroupManagementPlugin.getGroupUsers = jest.fn().mockRejectedValue(new GroupNotFoundError());

      await expect(
        dynamicAuthzService.getGroupUsers({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(GroupNotFoundError);
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

  describe('isUserAssignedToGroup', () => {
    it('returns a boolean in the data object that tells if the user is in the group', async () => {
      mockGroupManagementPlugin.isUserAssignedToGroup = jest
        .fn()
        .mockResolvedValue({ data: { isAssigned: true } });

      const response = await dynamicAuthzService.isUserAssignedToGroup({
        userId,
        groupId,
        authenticatedUser: mockUser
      });

      expect(response).toMatchObject<IsUserAssignedToGroupResponse>({ data: { isAssigned: true } });
    });

    it('throws when the user cannot be found', async () => {
      mockGroupManagementPlugin.isUserAssignedToGroup = jest.fn().mockRejectedValue(new UserNotFoundError());

      await expect(
        dynamicAuthzService.isUserAssignedToGroup({ userId, groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe('doesGroupExist', () => {
    it('throws a not implemented exception', async () => {
      await expect(
        dynamicAuthzService.doesGroupExist({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(Error);
    });
  });
});
