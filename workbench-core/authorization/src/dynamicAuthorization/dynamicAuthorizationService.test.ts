/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditPlugin, AuditService, BaseAuditPlugin, Writer } from '@aws/workbench-core-audit';
import { Action } from '../action';
import { AuthenticatedUser } from '../authenticatedUser';
import { GroupNotFoundError } from '../errors/groupNotFoundError';
import { ThroughputExceededError } from '../errors/throughputExceededError';
import { Effect } from '../permission';
import { CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import { IdentityPermission, IdentityType } from './dynamicAuthorizationInputs/identityPermission';
import { DynamicAuthorizationPermissionsPlugin } from './dynamicAuthorizationPermissionsPlugin';
import { DynamicAuthorizationService } from './dynamicAuthorizationService';
import { GroupManagementPlugin } from './groupManagementPlugin';
import { GroupStatus } from './models/GroupMetadata';

describe('WBCGroupManagemntPlugin', () => {
  let auditService: AuditService;
  let auditPlugin: AuditPlugin;
  let mockAuditWriter: Writer;

  let mockUser: AuthenticatedUser;
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
    mockAuditWriter = {
      write: jest.fn()
    };
    auditPlugin = new BaseAuditPlugin(mockAuditWriter);

    auditService = new AuditService(auditPlugin);
  });

  beforeEach(() => {
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

  describe('createIdentityPermissions', () => {
    const sampleGroupId = 'sampleGroup';
    const sampleGroupType: IdentityType = 'GROUP';

    const sampleAction: Action = 'CREATE';
    const sampleEffect: Effect = 'ALLOW';
    const sampleSubjectType = 'sampleSubjectType';
    const sampleSubjectId = 'sampleSubjectId';
    const sampleConditions = {};
    const sampleFields: string[] = [];
    const sampleDescription: string = 'sampleDescription';

    const mockIdentityPermission: IdentityPermission = {
      action: sampleAction,
      effect: sampleEffect,
      subjectType: sampleSubjectType,
      subjectId: sampleSubjectId,
      identityId: sampleGroupId,
      identityType: sampleGroupType,
      conditions: sampleConditions,
      fields: sampleFields,
      description: sampleDescription
    } as const;

    const mockIdentityPermissions = [mockIdentityPermission, mockIdentityPermission];

    beforeAll(() => {
      jest.spyOn(auditService, 'write');
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

      expect(auditService.write).toBeCalledWith(
        {
          actor: mockUser,
          source: {
            serviceName: 'DynamicAuthorizationService'
          },
          action: 'createIdentityPermissions',
          requestBody: params,
          statusCode: 'success'
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
      expect(auditService.write).toBeCalledWith(
        {
          actor: mockUser,
          source: {
            serviceName: 'DynamicAuthorizationService'
          },
          action: 'createIdentityPermissions',
          requestBody: params,
          statusCode: 'failure'
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
      expect(auditService.write).toBeCalledWith(
        {
          actor: mockUser,
          source: {
            serviceName: 'DynamicAuthorizationService'
          },
          action: 'createIdentityPermissions',
          requestBody: params,
          statusCode: 'failure'
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

      expect(auditService.write).toBeCalledWith(
        {
          actor: mockUser,
          source: {
            serviceName: 'DynamicAuthorizationService'
          },
          action: 'createIdentityPermissions',
          requestBody: params,
          statusCode: 'failure'
        },
        new ThroughputExceededError('Exceeds 100 identity permissions')
      );
    });
  });
});
