/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin } from '@aws/workbench-core-audit';
import { LoggingService } from '@aws/workbench-core-logging';
import { Request, Response, NextFunction } from 'express';
import AuthorizationPlugin from '../authorizationPlugin';
import { ForbiddenError } from '../errors/forbiddenError';
import { AuthenticatedUser } from '../models/authenticatedUser';
import withDynamicAuth from './dynamicAuthorizationMiddleware';
import { DynamicAuthorizationPermissionsPlugin } from './dynamicAuthorizationPermissionsPlugin';
import { DynamicAuthorizationService } from './dynamicAuthorizationService';
import { GroupManagementPlugin } from './groupManagementPlugin';

describe('dynamicAuthorizationMiddleware tests', () => {
  let dynamicAuthorizationService: DynamicAuthorizationService;
  let mockGroupManagementPlugin: GroupManagementPlugin;
  let mockDynamicAuthorizationPermissionsPlugin: DynamicAuthorizationPermissionsPlugin;
  let mockAuthorizationPlugin: AuthorizationPlugin;
  let auditService: AuditService;
  let mockUser: AuthenticatedUser;
  let dynamicAuthzMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  beforeEach(() => {
    mockUser = {
      id: 'sampleUserId',
      roles: []
    };
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
      doesGroupExist: jest.fn()
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
    auditService = new AuditService(
      new BaseAuditPlugin({
        write: jest.fn()
      })
    );
    mockAuthorizationPlugin = {
      isAuthorized: jest.fn(),
      isAuthorizedOnDynamicOperations: jest.fn()
    };
    dynamicAuthorizationService = new DynamicAuthorizationService({
      auditService,
      authorizationPlugin: mockAuthorizationPlugin,
      dynamicAuthorizationPermissionsPlugin: mockDynamicAuthorizationPermissionsPlugin,
      groupManagementPlugin: mockGroupManagementPlugin
    });
    dynamicAuthorizationService.isAuthorizedOnRoute = jest.fn();
    dynamicAuthzMiddleware = withDynamicAuth(dynamicAuthorizationService);
    dynamicAuthorizationService.isRouteIgnored = jest.fn().mockResolvedValue({
      data: {
        routeIgnored: false
      }
    });
  });

  test('Proper request object and user is authorized', async () => {
    const next = jest.fn();
    const response: Response = {
      locals: {
        user: mockUser
      }
    } as unknown as Response;
    const request: Request = {
      method: 'GET',
      baseUrl: '',
      path: '/sample'
    } as Request;
    await dynamicAuthzMiddleware(request, response, next);
    expect(next).toBeCalled();
  });

  test('Proper request object and route is ignored', async () => {
    const next = jest.fn();
    dynamicAuthorizationService.isRouteIgnored = jest.fn().mockResolvedValue({
      data: {
        routeIgnored: true
      }
    });
    const response: Response = {} as unknown as Response;

    const request: Request = {
      method: 'GET',
      baseUrl: '',
      path: '/login'
    } as Request;
    await dynamicAuthzMiddleware(request, response, next);
    expect(next).toBeCalled();
  });

  test('missing user should return a 403', async () => {
    const next = jest.fn();
    const response: Response = {
      status: jest.fn().mockImplementation((statusCode: number) => {
        return response;
      }),
      json: jest.fn()
    } as unknown as Response;
    const request: Request = {
      method: 'GET',
      baseUrl: '',
      path: '/sample'
    } as Request;
    await dynamicAuthzMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });

  test('missing method should return a 403', async () => {
    const next = jest.fn();
    const response: Response = {
      locals: {
        user: mockUser
      },
      status: jest.fn().mockImplementation((statusCode: number) => {
        return response;
      }),
      json: jest.fn()
    } as unknown as Response;
    const request: Request = {
      baseUrl: '',
      path: '/sample'
    } as Request;
    await dynamicAuthzMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });

  test('unauthorized should return a 403', async () => {
    const next = jest.fn();
    const response: Response = {
      locals: {
        user: mockUser
      },
      status: jest.fn().mockImplementation((statusCode: number) => {
        return response;
      }),
      json: jest.fn()
    } as unknown as Response;
    const request: Request = {
      baseUrl: '',
      method: 'GET',
      path: '/sample'
    } as Request;
    dynamicAuthorizationService.isAuthorizedOnRoute = jest.fn().mockRejectedValue(new ForbiddenError());
    await dynamicAuthzMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });

  test('Ensure logging of error when logger is provided', async () => {
    const logger: LoggingService = new LoggingService();
    const loggerErrorSpy = jest.spyOn(logger, 'error');
    const next = jest.fn();
    const response: Response = {
      locals: {
        user: mockUser
      },
      status: jest.fn().mockImplementation((statusCode: number) => {
        return response;
      }),
      json: jest.fn()
    } as unknown as Response;
    const request: Request = {
      baseUrl: '',
      method: 'GET',
      path: '/sample'
    } as Request;
    dynamicAuthorizationService.isAuthorizedOnRoute = jest.fn().mockRejectedValue(new ForbiddenError());
    dynamicAuthzMiddleware = withDynamicAuth(dynamicAuthorizationService, { logger });
    await dynamicAuthzMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(loggerErrorSpy).toBeCalled();
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });
});
