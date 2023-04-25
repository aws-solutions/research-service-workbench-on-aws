/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin } from '@aws/workbench-core-audit';
import { JSONValue } from '@aws/workbench-core-base';
import { UserNotFoundError } from '@aws/workbench-core-user-management';
import AuthorizationPlugin from '../authorizationPlugin';
import { ForbiddenError } from '../errors/forbiddenError';
import { GroupAlreadyExistsError } from '../errors/groupAlreadyExistsError';
import { GroupNotFoundError } from '../errors/groupNotFoundError';
import { ParamNotFoundError } from '../errors/paramNotFoundError';
import { RetryError } from '../errors/retryError';
import { RouteNotSecuredError } from '../errors/routeNotSecuredError';
import { ThroughputExceededError } from '../errors/throughputExceededError';
import { Action } from '../models/action';
import { AuthenticatedUser } from '../models/authenticatedUser';
import { Effect } from '../models/effect';
import { HTTPMethod } from '../models/routesMap';
import { DynamicAuthorizationPermissionsPlugin } from './dynamicAuthorizationPermissionsPlugin';
import { DynamicAuthorizationService } from './dynamicAuthorizationService';
import { GroupManagementPlugin } from './groupManagementPlugin';
import { CreateGroupResponse } from './models/createGroup';
import { DeleteGroupResponse, DeleteGroupRequest } from './models/deleteGroup';
import { DoesGroupExistResponse } from './models/doesGroupExist';
import { DynamicOperation } from './models/dynamicOperation';
import { GetGroupUsersResponse } from './models/getGroupUsers';
import { GetUserGroupsResponse } from './models/getUserGroups';
import { IdentityPermission, IdentityType } from './models/identityPermission';
import { IsAuthorizedOnSubjectRequest } from './models/isAuthorizedOnSubject';
import { IsUserAssignedToGroupResponse } from './models/isUserAssignedToGroup';
import { RemoveUserFromGroupResponse } from './models/removeUserFromGroup';

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
  let mockAuthorizationPlugin: AuthorizationPlugin;

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
      setGroupStatus: jest.fn(),
      doesGroupExist: jest.fn(),
      validateUserGroups: jest.fn()
    };

    mockDynamicAuthorizationPermissionsPlugin = {
      isRouteIgnored: jest.fn(),
      isRouteProtected: jest.fn(),
      getDynamicOperationsByRoute: jest.fn(),
      createIdentityPermissions: jest.fn(),
      deleteIdentityPermissions: jest.fn(),
      getIdentityPermissionsByIdentity: jest.fn(),
      getIdentityPermissionsBySubject: jest.fn(),
      deleteSubjectIdentityPermissions: jest.fn()
    };

    mockAuthorizationPlugin = {
      isAuthorized: jest.fn(),
      isAuthorizedOnDynamicOperations: jest.fn()
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
      id: '12345678-1234-1234-1234-123456789012',
      roles: []
    };

    auditSource = {
      serviceName: DynamicAuthorizationService.name
    };

    dynamicAuthzService = new DynamicAuthorizationService({
      groupManagementPlugin: mockGroupManagementPlugin,
      dynamicAuthorizationPermissionsPlugin: mockDynamicAuthorizationPermissionsPlugin,
      auditService,
      authorizationPlugin: mockAuthorizationPlugin
    });

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
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('isAuthorizedOnSubject', () => {
    let mockDynamicOperation: DynamicOperation;
    let params: IsAuthorizedOnSubjectRequest;
    beforeEach(() => {
      mockUser = {
        id: '12345678-1234-1234-1234-123456789012',
        roles: ['sampleGroupId']
      };
      mockDynamicOperation = {
        action: sampleAction,
        subject: {
          subjectType: sampleSubjectType,
          subjectId: sampleSubjectId
        }
      };
      auditAction = 'isAuthorizedOnSubject';
      params = {
        authenticatedUser: mockUser,
        dynamicOperation: mockDynamicOperation
      };
      mockGroupManagementPlugin.validateUserGroups = jest.fn().mockResolvedValue({
        validGroupIds: mockUser.roles
      });
    });
    test('is authorized on subject', async () => {
      mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            identityPermissions: mockIdentityPermissions
          }
        })
        .mockResolvedValueOnce({
          data: {
            identityPermissions: []
          }
        });
      await expect(dynamicAuthzService.isAuthorizedOnSubject(params)).resolves.not.toThrow();
      expect(auditServiceWriteSpy).toHaveBeenCalledWith({
        actor: mockUser,
        source: auditSource,
        action: auditAction,
        requestBody: params,
        statusCode: 200
      });
    });

    test('is authorized on all subject', async () => {
      //require access to all subjectType with any
      params.dynamicOperation.subject.subjectId = '*';
      mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            identityPermissions: mockIdentityPermissions
          },
          paginationToken: 'samplePaginationToken'
        })
        .mockResolvedValueOnce({
          data: {
            identityPermissions: mockIdentityPermissions
          }
        });
      await expect(dynamicAuthzService.isAuthorizedOnSubject(params)).resolves.not.toThrow();
      expect(mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject).toBeCalledTimes(2);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith({
        actor: mockUser,
        source: auditSource,
        action: auditAction,
        requestBody: params,
        statusCode: 200
      });
    });
    test('is authorized on subject, get all paginated results', async () => {
      mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            identityPermissions: mockIdentityPermissions
          },
          paginationToken: 'samplePaginationToken'
        })
        .mockResolvedValueOnce({
          data: {
            identityPermissions: mockIdentityPermissions
          }
        })
        .mockResolvedValueOnce({
          data: {
            identityPermissions: []
          }
        });
      await expect(dynamicAuthzService.isAuthorizedOnSubject(params)).resolves.not.toThrow();
      expect(mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject).toBeCalledTimes(3);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith({
        actor: mockUser,
        source: auditSource,
        action: auditAction,
        requestBody: params,
        statusCode: 200
      });
    });

    test('is authorized on subject, get all paginated results, authorizationPlugin throws ForbiddenError', async () => {
      mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            identityPermissions: mockIdentityPermissions
          },
          paginationToken: 'samplePaginationToken'
        })
        .mockResolvedValueOnce({
          data: {
            identityPermissions: mockIdentityPermissions
          }
        })
        .mockResolvedValueOnce({
          data: {
            identityPermissions: []
          }
        });
      mockAuthorizationPlugin.isAuthorizedOnDynamicOperations = jest
        .fn()
        .mockRejectedValueOnce(new ForbiddenError());
      await expect(
        dynamicAuthzService.isAuthorizedOnSubject({
          authenticatedUser: mockUser,
          dynamicOperation: mockDynamicOperation
        })
      ).rejects.toThrowError(ForbiddenError);

      expect(mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject).toBeCalledTimes(3);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 400
        },
        new ForbiddenError()
      );
    });
  });

  describe('isRouteIgnored', () => {
    test('check is route ignored', async () => {
      const mockReturnValue = {
        data: {
          routeIgnored: true
        }
      };
      const route = '/sampleRoute';
      const method: HTTPMethod = 'GET';
      const params = {
        route,
        method
      };
      mockDynamicAuthorizationPermissionsPlugin.isRouteIgnored = jest
        .fn()
        .mockResolvedValueOnce(mockReturnValue);
      const response = await dynamicAuthzService.isRouteIgnored(params);
      expect(response).toStrictEqual(mockReturnValue);
    });
  });

  describe('isRouteProtected', () => {
    test('check is route protected', async () => {
      const mockReturnValue = {
        data: {
          routeProtected: true
        }
      };
      const route = '/sampleRoute';
      const method: HTTPMethod = 'GET';
      const params = {
        route,
        method
      };
      mockDynamicAuthorizationPermissionsPlugin.isRouteProtected = jest
        .fn()
        .mockResolvedValueOnce(mockReturnValue);
      const response = await dynamicAuthzService.isRouteProtected(params);
      expect(response).toStrictEqual(mockReturnValue);
    });
  });

  describe('isAuthorizedOnRoute', () => {
    let mockDynamicOperations: DynamicOperation[];
    let mockIdentityPermissions: IdentityPermission[];
    let mockRoute: string;
    let mockMethod: HTTPMethod;
    let mockParams: Record<string, string>;
    beforeEach(() => {
      mockUser = {
        id: '12345678-1234-1234-1234-123456789012',
        roles: ['sampleGroupId']
      };
      auditAction = 'isAuthorizedOnRoute';
      mockDynamicOperations = [
        {
          action: 'CREATE',
          subject: {
            subjectId: '${subjectId}',
            subjectType: 'sampleSubjectType',
            parentId: '${parentId}'
          }
        }
      ];
      mockIdentityPermissions = [
        {
          identityId: sampleGroupId,
          identityType: 'GROUP',
          action: 'CREATE',
          subjectId: 'sampleSubjectId',
          subjectType: 'sampleSubjectType',
          effect: 'ALLOW',
          conditions: {
            parentId: { $eq: 'sampleParentId' }
          }
        }
      ];
      mockRoute = '/sample/route';
      mockMethod = 'GET';
      mockParams = {
        parentId: 'sampleParentId',
        subjectId: 'sampleSubjectId'
      };
      mockGroupManagementPlugin.validateUserGroups = jest.fn().mockResolvedValue({
        validGroupIds: mockUser.roles
      });
    });

    test('user is authorized on a simple route, that is protected', async () => {
      mockDynamicAuthorizationPermissionsPlugin.isRouteIgnored = jest.fn().mockResolvedValueOnce({
        data: {
          routeIgnored: false
        }
      });
      mockDynamicAuthorizationPermissionsPlugin.isRouteProtected = jest.fn().mockResolvedValueOnce({
        data: {
          routeProtected: true
        }
      });
      mockDynamicAuthorizationPermissionsPlugin.getDynamicOperationsByRoute = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            dynamicOperations: mockDynamicOperations
          }
        });
      mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject = jest
        .fn()
        .mockResolvedValue({
          data: {
            identityPermissions: mockIdentityPermissions
          }
        })
        .mockResolvedValueOnce({
          data: {
            identityPermissions: []
          }
        });
      const params = {
        authenticatedUser: mockUser,
        route: mockRoute,
        method: mockMethod,
        params: mockParams
      };
      mockAuthorizationPlugin.isAuthorizedOnDynamicOperations = jest.fn();
      await expect(dynamicAuthzService.isAuthorizedOnRoute(params)).resolves.not.toThrow();

      expect(auditServiceWriteSpy).toHaveBeenCalledWith({
        actor: mockUser,
        source: auditSource,
        action: auditAction,
        requestBody: params,
        statusCode: 200
      });
    });

    test('user is authorized on a route with multiple dynamic operations', async () => {
      const dynamicOperations: DynamicOperation[] = [
        {
          action: 'READ',
          subject: {
            subjectId: '${subjectId}',
            subjectType: 'sampleSubjectType',
            parentId: '${parentId}'
          }
        },
        {
          action: 'READ',
          subject: {
            subjectId: '${subjectId}',
            subjectType: 'sampleSubjectType',
            parentId: '${parentId2}'
          }
        },
        {
          action: 'READ',
          subject: {
            subjectId: '*',
            subjectType: 'sampleSubjectType'
          }
        }
      ];
      mockParams.parentId2 = 'sampleParentId2';

      mockDynamicAuthorizationPermissionsPlugin.isRouteIgnored = jest.fn().mockResolvedValueOnce({
        data: {
          routeIgnored: false
        }
      });
      mockDynamicAuthorizationPermissionsPlugin.isRouteProtected = jest.fn().mockResolvedValueOnce({
        data: {
          routeProtected: true
        }
      });
      mockDynamicAuthorizationPermissionsPlugin.getDynamicOperationsByRoute = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            dynamicOperations,
            pathParams: mockParams
          }
        });
      mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject = jest
        .fn()
        .mockResolvedValue({
          data: {
            identityPermissions: mockIdentityPermissions
          }
        });
      const params = {
        authenticatedUser: mockUser,
        route: mockRoute,
        method: mockMethod
      };
      mockAuthorizationPlugin.isAuthorizedOnDynamicOperations = jest.fn();
      await expect(dynamicAuthzService.isAuthorizedOnRoute(params)).resolves.not.toThrow();

      expect(auditServiceWriteSpy).toHaveBeenCalledWith({
        actor: mockUser,
        source: auditSource,
        action: auditAction,
        requestBody: params,
        statusCode: 200
      });
    });

    test('throws ParamNotFound when required params are needed', async () => {
      mockDynamicAuthorizationPermissionsPlugin.isRouteIgnored = jest.fn().mockResolvedValueOnce({
        data: {
          routeIgnored: false
        }
      });
      mockDynamicAuthorizationPermissionsPlugin.isRouteProtected = jest.fn().mockResolvedValueOnce({
        data: {
          routeProtected: true
        }
      });
      mockDynamicAuthorizationPermissionsPlugin.getDynamicOperationsByRoute = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            dynamicOperations: mockDynamicOperations
          }
        });
      const params = {
        authenticatedUser: mockUser,
        route: mockRoute,
        method: mockMethod
      };
      await expect(dynamicAuthzService.isAuthorizedOnRoute(params)).rejects.toThrowError(ParamNotFoundError);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 400
        },
        new ParamNotFoundError('Missing parameter')
      );
    });

    test('user is authorized on route ignored', async () => {
      mockDynamicAuthorizationPermissionsPlugin.isRouteIgnored = jest.fn().mockResolvedValueOnce({
        data: {
          routeIgnored: true
        }
      });
      const params = {
        authenticatedUser: mockUser,
        route: mockRoute,
        method: mockMethod,
        params: mockParams
      };
      await expect(dynamicAuthzService.isAuthorizedOnRoute(params)).resolves.not.toThrow();

      expect(auditServiceWriteSpy).toHaveBeenCalledWith({
        actor: mockUser,
        source: auditSource,
        action: auditAction,
        requestBody: params,
        statusCode: 200
      });
    });
    test('RouteNotSecuredError thrown when no protection found', async () => {
      mockDynamicAuthorizationPermissionsPlugin.isRouteIgnored = jest.fn().mockResolvedValueOnce({
        data: {
          routeIgnored: false
        }
      });
      mockDynamicAuthorizationPermissionsPlugin.isRouteProtected = jest.fn().mockResolvedValueOnce({
        data: {
          routeProtected: false
        }
      });
      const params = {
        authenticatedUser: mockUser,
        route: mockRoute,
        method: mockMethod,
        params: mockParams
      };
      await expect(dynamicAuthzService.isAuthorizedOnRoute(params)).rejects.toThrowError(
        RouteNotSecuredError
      );
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 400
        },
        new RouteNotSecuredError('Route is not secured')
      );
    });
    test('ensure params are being escaped when using regex', async () => {
      mockDynamicAuthorizationPermissionsPlugin.isRouteIgnored = jest.fn().mockResolvedValueOnce({
        data: {
          routeIgnored: false
        }
      });
      mockDynamicAuthorizationPermissionsPlugin.isRouteProtected = jest.fn().mockResolvedValueOnce({
        data: {
          routeProtected: true
        }
      });
      mockDynamicAuthorizationPermissionsPlugin.getDynamicOperationsByRoute = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            dynamicOperations: mockDynamicOperations
          }
        });

      mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            identityPermissions: mockIdentityPermissions
          }
        })
        .mockResolvedValueOnce({
          data: {
            identityPermissions: []
          }
        });
      mockParams = {
        subjectId: '${string}',
        parentId: '${string}'
      };
      const params = {
        authenticatedUser: mockUser,
        route: mockRoute,
        method: mockMethod,
        params: mockParams
      };
      mockAuthorizationPlugin.isAuthorizedOnDynamicOperations = jest
        .fn()
        .mockRejectedValueOnce(new ForbiddenError());
      await expect(dynamicAuthzService.isAuthorizedOnRoute(params)).rejects.toThrowError(ForbiddenError);

      const filledDynamicOperations = [
        {
          action: 'CREATE',
          subject: {
            subjectId: '\\$\\{string\\}',
            subjectType: 'sampleSubjectType',
            parentId: '\\$\\{string\\}'
          }
        }
      ];
      expect(mockAuthorizationPlugin.isAuthorizedOnDynamicOperations).toBeCalledWith(
        mockIdentityPermissions,
        filledDynamicOperations
      );
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 400
        },
        new ForbiddenError()
      );
    });
    test('user is unauthorized on route, throw ForbiddenError', async () => {
      mockDynamicAuthorizationPermissionsPlugin.isRouteIgnored = jest.fn().mockResolvedValueOnce({
        data: {
          routeIgnored: false
        }
      });
      mockDynamicAuthorizationPermissionsPlugin.isRouteProtected = jest.fn().mockResolvedValueOnce({
        data: {
          routeProtected: true
        }
      });
      mockDynamicAuthorizationPermissionsPlugin.getDynamicOperationsByRoute = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            dynamicOperations: mockDynamicOperations
          }
        });
      mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            identityPermissions: mockIdentityPermissions
          }
        })
        .mockResolvedValueOnce({
          data: {
            identityPermissions: []
          }
        });
      const params = {
        authenticatedUser: mockUser,
        route: mockRoute,
        method: mockMethod,
        params: mockParams
      };
      mockAuthorizationPlugin.isAuthorizedOnDynamicOperations = jest
        .fn()
        .mockRejectedValueOnce(new ForbiddenError());
      await expect(dynamicAuthzService.isAuthorizedOnRoute(params)).rejects.toThrowError(ForbiddenError);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 400
        },
        new ForbiddenError()
      );
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

      expect(response).toStrictEqual<CreateGroupResponse>(mockReturnValue);
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
    let params: DeleteGroupRequest;
    let mockIdentityPermission: IdentityPermission;
    beforeEach(() => {
      params = { groupId, authenticatedUser: mockUser };
      auditAction = 'deleteGroup';
      mockIdentityPermission = {
        identityId: groupId,
        identityType: 'GROUP',
        action: 'CREATE',
        effect: 'ALLOW',
        subjectId: 'sampleSubjectId',
        subjectType: 'sampleSubjectType'
      };

      dynamicAuthzService.getIdentityPermissionsByIdentity = jest.fn().mockResolvedValue({
        data: {
          identityPermissions: [mockIdentityPermission]
        }
      });

      dynamicAuthzService.deleteIdentityPermissions = jest.fn();
    });

    it('returns the groupID in the data object when the group was successfully deleted', async () => {
      const mockReturnValue = { data: { groupId } };
      mockGroupManagementPlugin.deleteGroup = jest.fn().mockResolvedValue(mockReturnValue);

      const response = await dynamicAuthzService.deleteGroup(params);

      expect(response).toStrictEqual<DeleteGroupResponse>(mockReturnValue);
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

    it('ensure deleting non existent group throws GroupNotFoundError', async () => {
      const mockRejectError = new GroupNotFoundError();
      mockGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(mockRejectError);

      await expect(dynamicAuthzService.deleteGroup(params)).rejects.toThrow(GroupNotFoundError);

      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 400
        },
        new GroupNotFoundError('Group does not exist')
      );
    });

    it('ensure deletion paginates over all identity permissions associated to group', async () => {
      const mockReturnValue = { data: { groupId } };
      mockGroupManagementPlugin.deleteGroup = jest.fn().mockResolvedValue(mockReturnValue);
      dynamicAuthzService.getIdentityPermissionsByIdentity = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            identityPermissions: [mockIdentityPermission]
          },
          paginationToken: 'samplePaginationToken'
        })
        .mockResolvedValueOnce({
          data: {
            identityPermissions: [mockIdentityPermission]
          }
        });
      const deleteIdentityPermissionsSpy = jest.spyOn(dynamicAuthzService, 'deleteIdentityPermissions');

      const response = await dynamicAuthzService.deleteGroup(params);
      expect(response).toStrictEqual<DeleteGroupResponse>(mockReturnValue);
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
      expect(deleteIdentityPermissionsSpy).toBeCalledWith({
        authenticatedUser: mockUser,
        identityPermissions: [mockIdentityPermission, mockIdentityPermission]
      });
    });

    it('throws exception when get group status has throws error that is not GroupNotFoundError', async () => {
      const mockRejectedValue = new Error();
      mockGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(mockRejectedValue);

      await expect(dynamicAuthzService.deleteGroup(params)).rejects.toThrow(mockRejectedValue);

      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 400
        },
        mockRejectedValue
      );
    });

    it('throws exception when identity permissions retrieval fails', async () => {
      const mockReturnValue = new Error();
      dynamicAuthzService.getIdentityPermissionsByIdentity = jest.fn().mockRejectedValue(mockReturnValue);

      await expect(dynamicAuthzService.deleteGroup(params)).rejects.toThrow(RetryError);

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

    it('throws exception when group status update fails', async () => {
      const mockReturnValue = new GroupNotFoundError('Group does not exist.');
      mockGroupManagementPlugin.setGroupStatus = jest.fn().mockRejectedValue(mockReturnValue);

      await expect(dynamicAuthzService.deleteGroup(params)).rejects.toThrow(GroupNotFoundError);

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

    it('throws RetryError exception when deletion of identity permissions fails', async () => {
      const mockReturnValue = new Error();
      dynamicAuthzService.deleteIdentityPermissions = jest.fn().mockRejectedValue(mockReturnValue);

      await expect(dynamicAuthzService.deleteGroup(params)).rejects.toThrow(RetryError);

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

    it('throws exception when the group is not successfully deleted', async () => {
      const mockReturnValue = new GroupNotFoundError();
      mockGroupManagementPlugin.deleteGroup = jest.fn().mockRejectedValue(mockReturnValue);

      await expect(dynamicAuthzService.deleteGroup(params)).rejects.toThrow(GroupNotFoundError);
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

  describe('createIdentityPermissions', () => {
    beforeEach(() => {
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
  describe('getIdentityPermissionsByIdentity', () => {
    test('get identity permissions by identity', async () => {
      mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsByIdentity = jest
        .fn()
        .mockResolvedValue({
          data: {
            identityPermissions: [mockIdentityPermission]
          }
        });
      const request = {
        identityId: sampleGroupId,
        identityType: sampleGroupType
      };

      const { data } = await dynamicAuthzService.getIdentityPermissionsByIdentity(request);
      expect(data.identityPermissions).toStrictEqual([mockIdentityPermission]);
    });
  });
  describe('deleteIdentityPermissions', () => {
    beforeEach(() => {
      auditAction = 'deleteIdentityPermissions';
    });

    test('delete identity permissions', async () => {
      const mockReturnValue = {
        data: {
          identityPermissions: mockIdentityPermissions
        },
        authenticatedUser: mockUser
      };
      mockDynamicAuthorizationPermissionsPlugin.deleteIdentityPermissions = jest
        .fn()
        .mockResolvedValueOnce(mockReturnValue);
      const params = {
        authenticatedUser: mockUser,
        identityPermissions: mockIdentityPermissions
      };
      const response = await dynamicAuthzService.deleteIdentityPermissions(params);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 200
        },
        response
      );
    });

    test('delete identity permissions, throws ThroughputExceededError', async () => {
      mockDynamicAuthorizationPermissionsPlugin.deleteIdentityPermissions = jest
        .fn()
        .mockRejectedValueOnce(new ThroughputExceededError());
      const params = {
        authenticatedUser: mockUser,
        identityPermissions: mockIdentityPermissions
      };
      await expect(dynamicAuthzService.deleteIdentityPermissions(params)).rejects.toThrow(
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
        new ThroughputExceededError()
      );
    });
  });

  describe('getIdentityPermissionsBySubject', () => {
    test('get identity permissions by subject', async () => {
      mockDynamicAuthorizationPermissionsPlugin.getIdentityPermissionsBySubject = jest
        .fn()
        .mockResolvedValue({
          data: {
            identityPermissions: [mockIdentityPermission]
          }
        });
      const request = {
        subjectId: sampleSubjectId,
        subjectType: sampleSubjectType
      };
      const { data } = await dynamicAuthzService.getIdentityPermissionsBySubject(request);
      expect(data.identityPermissions).toStrictEqual([mockIdentityPermission]);
    });
  });

  describe('addUserToGroup', () => {
    beforeAll(() => {
      auditAction = 'addUserToGroup';
    });

    it('returns userID and groupID when user was successfully added to group', async () => {
      const mockReturnValue = { data: { userId, groupId } };
      mockGroupManagementPlugin.addUserToGroup = jest.fn().mockResolvedValue(mockReturnValue);

      const requestBody = {
        userId,
        groupId,
        authenticatedUser: mockUser
      };

      const response = await dynamicAuthzService.addUserToGroup(requestBody);

      expect(response).toStrictEqual(mockReturnValue);

      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody,
          statusCode: 200
        },
        mockReturnValue
      );
    });

    test.each([
      [GroupNotFoundError, new GroupNotFoundError('Group does not exist.')],
      [
        GroupNotFoundError,
        new GroupNotFoundError(`Cannot assign user to group 'groupId'. It is pending delete.`)
      ]
    ])(
      'throws exception %s and writes to audit service when user management plugin throws %s',
      async (exceptionType, exceptionInstance) => {
        mockGroupManagementPlugin.addUserToGroup = jest.fn().mockRejectedValue(exceptionInstance);

        const requestBody = {
          groupId,
          userId,
          authenticatedUser: mockUser
        };

        await expect(dynamicAuthzService.addUserToGroup(requestBody)).rejects.toThrow(exceptionType);

        expect(auditServiceWriteSpy).toHaveBeenCalledWith(
          {
            actor: mockUser,
            source: auditSource,
            action: auditAction,
            requestBody,
            statusCode: 400
          },
          exceptionInstance
        );
      }
    );
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

      expect(response).toStrictEqual<RemoveUserFromGroupResponse>(mockReturnValue);
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

      expect(response).toStrictEqual<GetGroupUsersResponse>({ data: { userIds: [userId] } });
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

      expect(response).toStrictEqual<GetUserGroupsResponse>({ data: { groupIds: [groupId] } });
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

      expect(response).toStrictEqual<IsUserAssignedToGroupResponse>({ data: { isAssigned: true } });
    });

    it('throws when the user cannot be found', async () => {
      mockGroupManagementPlugin.isUserAssignedToGroup = jest.fn().mockRejectedValue(new UserNotFoundError());

      await expect(
        dynamicAuthzService.isUserAssignedToGroup({ userId, groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe('doesGroupExist', () => {
    it('returns the boolen given by the groupManagementPlugin', async () => {
      mockGroupManagementPlugin.doesGroupExist = jest.fn().mockResolvedValue({
        data: {
          exist: true
        }
      });
      const response = await dynamicAuthzService.doesGroupExist({
        groupId
      });
      expect(response).toStrictEqual<DoesGroupExistResponse>({ data: { exist: true } });
    });
  });

  describe('deleteSubjectIdentityPermissions', () => {
    beforeEach(() => {
      auditAction = 'deleteSubjectIdentityPermissions';
    });

    test('delete subject identity permissions', async () => {
      const mockReturnValue = {
        data: {
          identityPermissions: mockIdentityPermissions
        }
      };
      mockDynamicAuthorizationPermissionsPlugin.deleteSubjectIdentityPermissions = jest
        .fn()
        .mockResolvedValueOnce(mockReturnValue);
      const params = {
        authenticatedUser: mockUser,
        subjectType: sampleSubjectType,
        subjectId: sampleSubjectId
      };
      const response = await dynamicAuthzService.deleteSubjectIdentityPermissions(params);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 200
        },
        response
      );
    });

    test('delete subject identity permissions, throws RetryError', async () => {
      mockDynamicAuthorizationPermissionsPlugin.deleteSubjectIdentityPermissions = jest
        .fn()
        .mockRejectedValueOnce(new RetryError());
      const params = {
        authenticatedUser: mockUser,
        subjectType: sampleSubjectType,
        subjectId: sampleSubjectId
      };
      await expect(dynamicAuthzService.deleteSubjectIdentityPermissions(params)).rejects.toThrow(RetryError);
      expect(auditServiceWriteSpy).toHaveBeenCalledWith(
        {
          actor: mockUser,
          source: auditSource,
          action: auditAction,
          requestBody: params,
          statusCode: 400
        },
        new RetryError()
      );
    });
  });
});
