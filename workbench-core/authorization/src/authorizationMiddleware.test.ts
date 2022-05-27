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
import { AuthenticatedUser } from '@amzn/workbench-core-authentication';
import { Request, Response, NextFunction } from 'express';
import { fc, itProp } from 'jest-fast-check';
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
  let mockGuestPermissions: Permission[];
  let mockAdminPermissions: Permission[];
  let mockGetOperations: Operation[];
  let mockPutOperations: Operation[];
  let mockAdmin: AuthenticatedUser;
  let mockGuest: AuthenticatedUser;
  let errorMessage: string;
  beforeEach(() => {
    errorMessage = 'Permission is not granted';
    mockAdmin = {
      id: 'sampleUID',
      roles: ['admin']
    };
    mockGuest = {
      id: 'sampleUID',
      roles: ['guest']
    };
    mockGuestPermissions = [
      {
        effect: 'ALLOW',
        action: 'READ',
        subject: 'Sample'
      }
    ];
    mockAdminPermissions = [
      {
        effect: 'ALLOW',
        action: 'UPDATE',
        subject: 'Sample'
      },
      {
        effect: 'ALLOW',
        action: 'READ',
        subject: 'Sample'
      }
    ];

    mockPutOperations = [
      {
        action: 'UPDATE',
        subject: 'Sample'
      },
      {
        action: 'READ',
        subject: 'Sample'
      }
    ];
    mockGetOperations = [
      {
        action: 'READ',
        subject: 'Sample'
      }
    ];
    mockPermissionsPlugin = {
      getPermissionsByUser: jest.fn(async (user: AuthenticatedUser): Promise<Permission[]> => {
        if (user.roles.includes('admin')) {
          return mockAdminPermissions;
        } else {
          return mockGuestPermissions;
        }
      }),
      getOperationsByRoute: jest.fn(async (route: string, method: HTTPMethod): Promise<Operation[]> => {
        if (route === '/sample') {
          if (method === 'GET') return mockGetOperations;
          else if (method === 'PUT') return mockPutOperations;
        }
        throw new Error('Route not secured');
      })
    };
    mockAuthorizationPlugin = {
      isAuthorized: jest.fn(async (userPermissions: Permission[], operations: Operation[]): Promise<void> => {
        if (operations === mockPutOperations && userPermissions === mockAdminPermissions) {
          return;
        } else if (
          operations === mockGetOperations &&
          (userPermissions === mockAdminPermissions || userPermissions === mockGuestPermissions)
        ) {
          return;
        }
        throw new Error(errorMessage);
      })
    };
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

  itProp('Invalid request, deny request', [fc.anything()], async (request) => {
    const response: Response = {
      locals: {
        user: mockGuest
      },
      status: jest.fn().mockImplementation((statusCode: number) => {
        return response;
      }),
      json: jest.fn()
    } as unknown as Response;
    const next = jest.fn();
    await authorizationMiddleware(request as Request, response, next);
    expect(next).toBeCalledTimes(0);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });

  itProp('Invalid response should throw error', [fc.anything()], async (response) => {
    const next = jest.fn();
    const request: Request = {
      method: 'GET',
      originalUrl: '/sample'
    } as Request;
    try {
      await authorizationMiddleware(request, response as Response, next);
      expect.hasAssertions();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  itProp('Invalid next, deny request', [fc.anything()], async (next) => {
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
      method: 'GET',
      originalUrl: '/sample'
    } as Request;
    await authorizationMiddleware(request, response, next as NextFunction);
    expect(response.status).toBeCalledWith(403);
    expect(response.json).toBeCalledWith({ error: 'User is not authorized' });
  });
});
