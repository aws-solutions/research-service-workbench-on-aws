import {
  AuthorizationPlugin,
  Permission,
  PermissionsPlugin,
  HTTPMethod,
  Operation,
  AuthorizationService
} from '.';
import { User } from '@amzn/workbench-core-authentication';
import { fc, itProp } from 'jest-fast-check';

describe('Authorization Service', () => {
  let mockPermissionsPlugin: PermissionsPlugin;
  let mockAuthorizationPlugin: AuthorizationPlugin;
  let authorizationService: AuthorizationService;
  let mockGuestPermissions: Permission[];
  let mockAdminPermissions: Permission[];
  let mockGetOperations: Operation[];
  let mockPutOperations: Operation[];
  let mockAdmin: User;
  let mockGuest: User;
  let errorMessage: string;
  beforeEach(() => {
    errorMessage = 'Permission is not granted';
    mockAdmin = {
      uid: 'sampleUID',
      firstName: 'sampleFirst',
      lastName: 'sampleLast',
      email: 'sampleEmail',
      roles: ['admin']
    };
    mockGuest = {
      uid: 'sampleUID',
      firstName: 'sampleFirst',
      lastName: 'sampleLast',
      email: 'sampleEmail',
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
      getPermissionsByUser: jest.fn(async (user: User): Promise<Permission[]> => {
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
  });

  describe('isAuthorized', () => {
    test('guest authorized to GET request on /sample', () => {
      const route: string = '/sample';
      const method: HTTPMethod = 'GET';
      expect(async () => {
        await authorizationService.isAuthorizedOnRoute(mockGuest, route, method);
      }).not.toThrowError();
    });
    test('guest not authorized to PUT request on /sample', async () => {
      const route: string = '/sample';
      const method: HTTPMethod = 'PUT';
      try {
        await authorizationService.isAuthorizedOnRoute(mockGuest, route, method);
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(`User is forbidden: ${errorMessage}`);
      }
    });
    test('admin is authorized to PUT request on /sample', async () => {
      const route: string = '/sample';
      const method: HTTPMethod = 'PUT';
      expect(async () => {
        await authorizationService.isAuthorizedOnRoute(mockAdmin, route, method);
      }).not.toThrowError();
    });
    itProp('random user input', [fc.anything()], async (user) => {
      const route: string = '/sample';
      const method: HTTPMethod = 'PUT';
      try {
        await authorizationService.isAuthorizedOnRoute(user as User, route, method);
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
    itProp('random route input', [fc.anything()], async (route) => {
      const method: HTTPMethod = 'PUT';
      try {
        await authorizationService.isAuthorizedOnRoute(mockAdmin, route as string, method);
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
    itProp('random method input', [fc.anything()], async (method) => {
      const route: string = '/sample';
      try {
        await authorizationService.isAuthorizedOnRoute(mockAdmin, route, method as HTTPMethod);
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
