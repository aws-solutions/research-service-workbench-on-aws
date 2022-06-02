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
          )
      };
    });
});
jest.mock('./authorizationPlugin');
jest.mock('./permissionsPlugin');
import { AuthenticatedUser } from '@amzn/workbench-core-authentication';
import { Request, Response, NextFunction } from 'express';
import { MockAuthorizationPlugin } from './__mocks__/authorizationPlugin';
import { MockPermissionsPlugin } from './__mocks__/permissionsPlugin';
import {
  AuthorizationPlugin,
  HTTPMethod,
  Operation,
  Permission,
  PermissionsPlugin,
  withAuth,
  AuthorizationService
} from '.';

describe('authorization middleware', () => {
  let authorizationMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
  let authorizationService: AuthorizationService;
  let mockPermissionsPlugin: PermissionsPlugin;
  let mockAuthorizationPlugin: AuthorizationPlugin;
  let mockAdmin: AuthenticatedUser;
  let mockGuest: AuthenticatedUser;
  beforeEach(() => {
    mockAdmin = {
      id: 'sampleUID',
      roles: ['admin']
    };
    mockGuest = {
      id: 'sampleUID',
      roles: ['guest']
    };
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
      originalUrl: '/sample'
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
      originalUrl: '/sample'
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
      originalUrl: '/sample'
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
      originalUrl: '/randomRoute'
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
      originalUrl: '/sample'
    } as Request;
    await authorizationMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledWith(400);
    expect(response.json).toBeCalledWith({ error: 'Invalid request' });
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
      originalUrl: '/sample'
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
      originalUrl: '/sample'
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
      originalUrl: '/sample'
    } as Request;
    await authorizationMiddleware(request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });
});
