/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('./authorizationService', () => {
  return jest
    .fn()
    .mockImplementation((authorizationPlugin: AuthorizationPlugin, permissionsPlugin: PermissionsPlugin) => {
      return {
        isAuthorizedOnRoute: jest
          .fn()
          .mockImplementation(
            async (user: AuthenticatedUser, route: string, method: HTTPMethod): Promise<void> => {
              const permissions: Permission[] = await permissionsPlugin.getPermissionsByUser(user);
              const operations: Operation[] = await permissionsPlugin.getOperationsByRoute(route, method);
              await authorizationPlugin.isAuthorized(permissions, operations);
            }
          ),
        isRouteIgnored: jest
          .fn()
          .mockImplementation(async (route: string, method: HTTPMethod): Promise<boolean> => {
            return await permissionsPlugin.isRouteIgnored(route, method);
          })
      };
    });
});
jest.mock('./authorizationPlugin');
jest.mock('./permissionsPlugin');
import { LoggingService } from '@amzn/workbench-core-logging';
import { Request, Response, NextFunction } from 'express';
import { MockAuthorizationPlugin } from './__mocks__/authorizationPlugin';
import { MockPermissionsPlugin } from './__mocks__/permissionsPlugin';
import {
  AuthenticatedUser,
  AuthorizationPlugin,
  HTTPMethod,
  Operation,
  Permission,
  PermissionsPlugin,
  withAuth,
  AuthorizationService,
  retrieveUser
} from '.';

describe('authorization middleware', () => {
  let authorizationMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  let authorizationService: AuthorizationService;
  let mockPermissionsPlugin: PermissionsPlugin;
  let mockAuthorizationPlugin: AuthorizationPlugin;
  let mockAdmin: AuthenticatedUser;
  let mockGuest: AuthenticatedUser;
  let logger: LoggingService;
  beforeEach(() => {
    mockAdmin = {
      id: 'sampleAdminUID',
      roles: ['admin']
    };
    mockGuest = {
      id: 'sampleGuestUID',
      roles: ['guest']
    };
    logger = new LoggingService();
    jest.spyOn(logger, 'error').mockImplementation(() => {});
    mockPermissionsPlugin = new MockPermissionsPlugin();
    mockAuthorizationPlugin = new MockAuthorizationPlugin();
    authorizationService = new AuthorizationService(mockAuthorizationPlugin, mockPermissionsPlugin);
    authorizationMiddleware = withAuth(authorizationService);
  });

  test('Request has mockGuest with correct permissions for GET on /sample', async () => {
    const next = jest.fn();
    const response: Response = {
      locals: {
        user: mockGuest
      }
    } as unknown as Response;
    const request: Request = {
      method: 'GET',
      path: '/sample'
    } as Request;
    await authorizationMiddleware(request, response, next);
    expect(next).toBeCalled();
  });

  test('Request has mockAdmin with correct permissions for PUT on /sample', async () => {
    const next = jest.fn();
    const response: Response = {
      locals: {
        user: mockAdmin
      }
    } as unknown as Response;
    const request: Request = {
      method: 'PUT',
      path: '/sample'
    } as Request;
    await authorizationMiddleware(request, response, next);
    expect(next).toBeCalled();
  });

  test('Request has mockGuest with incorrect permissions for PUT on /sample', async () => {
    const next = jest.fn();
    const response: Response = {
      locals: {
        user: mockGuest
      },
      status: jest.fn().mockImplementation((statusCode: number) => {
        return response;
      }),
      json: jest.fn()
    } as unknown as Response;
    const request: Request = {
      method: 'PUT',
      path: '/sample'
    } as Request;
    await authorizationMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });

  test('Request has mockGuest for PUT on incorrect route', async () => {
    const next = jest.fn();
    const response: Response = {
      locals: {
        user: mockGuest
      },
      status: jest.fn().mockImplementation((statusCode: number) => {
        return response;
      }),
      json: jest.fn()
    } as unknown as Response;
    const request: Request = {
      method: 'PUT',
      path: '/randomRoute'
    } as Request;
    await authorizationMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });

  test('Request has mockGuest for incorrect Method on /sample', async () => {
    const next = jest.fn();
    const response: Response = {
      locals: {
        user: mockGuest
      },
      status: jest.fn().mockImplementation((statusCode: number) => {
        return response;
      }),
      json: jest.fn()
    } as unknown as Response;
    const request: Request = {
      method: 'IncorrectMethod',
      path: '/sample'
    } as Request;
    await authorizationMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });
  test('Request has no authenticatedUser for PUT on /sample', async () => {
    const next = jest.fn();
    const response: Response = {
      locals: {},
      status: jest.fn().mockImplementation((statusCode: number) => {
        return response;
      }),
      json: jest.fn()
    } as unknown as Response;
    const request: Request = {
      method: 'PUT',
      path: '/sample'
    } as Request;
    await authorizationMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });

  test('Request has authenticatedUser missing id for PUT on /sample', async () => {
    const next = jest.fn();
    const response: Response = {
      locals: {
        user: {
          roles: ['guest']
        }
      },
      status: jest.fn().mockImplementation((statusCode: number) => {
        return response;
      }),
      json: jest.fn()
    } as unknown as Response;
    const request: Request = {
      method: 'PUT',
      path: '/sample'
    } as Request;
    await authorizationMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });

  test('Request has authenticatedUser missing roles for PUT on /sample', async () => {
    const next = jest.fn();
    const response: Response = {
      locals: {
        user: {
          id: 'sampleId'
        }
      },
      status: jest.fn().mockImplementation((statusCode: number) => {
        return response;
      }),
      json: jest.fn()
    } as unknown as Response;
    const request: Request = {
      method: 'PUT',
      path: '/sample'
    } as Request;
    await authorizationMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });

  test('GET Request for login should be ignored', async () => {
    const next = jest.fn();
    const request: Request = {
      method: 'GET',
      path: '/login'
    } as Request;
    const response: Response = {} as Response;
    await authorizationMiddleware(request, response, next);
    expect(next).toBeCalledTimes(1);
  });

  test('logging errors', async () => {
    const next = jest.fn();
    const response: Response = {
      locals: {
        user: {
          id: 'sampleId'
        }
      },
      status: jest.fn().mockImplementation((statusCode: number) => {
        return response;
      }),
      json: jest.fn()
    } as unknown as Response;
    const request: Request = {
      method: 'PUT',
      path: '/sample'
    } as Request;
    authorizationMiddleware = withAuth(authorizationService, { logger });
    await authorizationMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(logger.error).toBeCalledTimes(1);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });

  describe('retrieveUser', () => {
    test('retrieveUser with correct schema', () => {
      const response: Response = {
        locals: {
          user: mockAdmin
        }
      } as unknown as Response;
      const user: AuthenticatedUser = retrieveUser(response);
      expect(user).toStrictEqual(mockAdmin);
    });

    test('retrieveUser with incorrect schema', () => {
      const response: Response = {
        locals: {
          user: {
            id: 'sampleId'
          }
        }
      } as unknown as Response;
      try {
        retrieveUser(response);
        expect.hasAssertions();
      } catch (err) {
        expect(err.message).toBe('Authenticated user is not found');
      }
    });

    test('retrieveUser without AuthenticatedUser', () => {
      const response: Response = {
        locals: {}
      } as unknown as Response;
      try {
        retrieveUser(response);
        expect.hasAssertions();
      } catch (err) {
        expect(err.message).toBe('Authenticated user is not found');
      }
    });
  });
});
