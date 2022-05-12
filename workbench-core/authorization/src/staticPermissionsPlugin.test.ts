import { User } from '@amzn/workbench-core-authentication';
import { LoggingService } from '@amzn/workbench-core-logging';
import { fc, itProp } from 'jest-fast-check';
import {
  PermissionsMap,
  Permission,
  Operation,
  RoutesMap,
  HTTPMethod,
  MethodToOperations,
  RoutesIgnored,
  StaticPermissionsPlugin
} from '.';

describe('StaticPermissionsPlugin', () => {
  let staticPermissionsPlugin: StaticPermissionsPlugin;
  let mockPermissionsMap: PermissionsMap;
  let mockUser: User;
  let role1Permissions: Permission[];
  let role2Permissions: Permission[];
  let logger: LoggingService;
  let routesMap: RoutesMap;
  let userRoute: MethodToOperations;
  let routesIgnored: RoutesIgnored;
  let userRouteGetOperations: Operation[];
  beforeEach(() => {
    role1Permissions = [
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
    role2Permissions = [
      {
        effect: 'ALLOW',
        action: 'CREATE',
        subject: 'Sample2'
      },
      {
        effect: 'DENY',
        action: 'DELETE',
        subject: 'Sample2'
      }
    ];
    mockPermissionsMap = {
      role1: role1Permissions,
      role2: role2Permissions
    };

    userRouteGetOperations = [
      {
        action: 'UPDATE',
        subject: 'User'
      },
      {
        action: 'READ',
        subject: 'User'
      }
    ];
    userRoute = {
      GET: userRouteGetOperations
    };
    routesMap = {
      '/user': userRoute
    };
    routesIgnored = {
      '/user': {
        PUT: true
      }
    };

    logger = new LoggingService();
    jest.spyOn(logger, 'warn');
    staticPermissionsPlugin = new StaticPermissionsPlugin(
      mockPermissionsMap,
      routesMap,
      routesIgnored,
      logger
    );
  });

  describe('getPermissionsByRoute', () => {
    test('GET user route operations', async () => {
      const getOperations = await staticPermissionsPlugin.getOperationsByRoute('/user', 'GET');
      expect(getOperations).toStrictEqual(userRouteGetOperations);
    });

    test('PUT user route operations, route is ignored', async () => {
      const putOperations = await staticPermissionsPlugin.getOperationsByRoute('/user', 'PUT');
      expect(putOperations).toHaveLength(0);
    });

    test('POST user route operations is not in routeMap and not ignored, should throw route is not secured error', async () => {
      try {
        await staticPermissionsPlugin.getOperationsByRoute('/user', 'POST');
        expect.hasAssertions();
      } catch (err) {
        expect(err.message).toBe('Route has not been secured');
      }
    });

    test('user route operations can not be modified', async () => {
      const modifiedGetOperations = await staticPermissionsPlugin.getOperationsByRoute('/user', 'GET');
      expect(modifiedGetOperations).toStrictEqual(userRouteGetOperations);
      modifiedGetOperations[0].action = 'DELETE';

      const orginalGetOperations = await staticPermissionsPlugin.getOperationsByRoute('/user', 'GET');
      expect(orginalGetOperations).not.toStrictEqual(modifiedGetOperations);
    });

    itProp(
      'random route inputs should throw error',
      [fc.anything(), fc.constantFrom('GET', 'PUT')],
      async (route, method) => {
        try {
          await staticPermissionsPlugin.getOperationsByRoute(route as string, method as HTTPMethod);
          expect.hasAssertions();
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
        }
      }
    );

    itProp(
      'random method inputs should throw error',
      [fc.constantFrom('/user'), fc.anything()],
      async (route, method) => {
        try {
          await staticPermissionsPlugin.getOperationsByRoute(route as string, method as HTTPMethod);
          expect.hasAssertions();
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
        }
      }
    );
  });

  describe('getPermissionsByUser', () => {
    test('single role user', async () => {
      mockUser = {
        uid: '1234567890',
        firstName: 'sampleFirst',
        lastName: 'sampleLast',
        email: 'sampleEmail',
        roles: ['role1']
      };

      const permissions: Permission[] = await staticPermissionsPlugin.getPermissionsByUser(mockUser);
      expect(permissions).toStrictEqual(role1Permissions);
    });

    test('multiple role user', async () => {
      mockUser = {
        uid: '1234567890',
        firstName: 'sampleFirst',
        lastName: 'sampleLast',
        email: 'sampleEmail',
        roles: ['role1', 'role2']
      };

      const permissions: Permission[] = await staticPermissionsPlugin.getPermissionsByUser(mockUser);
      expect(permissions).toStrictEqual(role1Permissions.concat(role2Permissions));
    });

    test('modify permissions should not be allowed', async () => {
      mockUser = {
        uid: '1234567890',
        firstName: 'sampleFirst',
        lastName: 'sampleLast',
        email: 'sampleEmail',
        roles: ['role1']
      };

      const modifidPermissions: Permission[] = await staticPermissionsPlugin.getPermissionsByUser(mockUser);
      expect(modifidPermissions).toStrictEqual(role1Permissions);

      modifidPermissions.forEach((permission) => {
        permission.action = 'CREATE';
      });
      const orignalPermissions: Permission[] = await staticPermissionsPlugin.getPermissionsByUser(mockUser);
      expect(orignalPermissions).not.toStrictEqual(modifidPermissions);
    });

    test('invalid role user', async () => {
      mockUser = {
        uid: '1234567890',
        firstName: 'sampleFirst',
        lastName: 'sampleLast',
        email: 'sampleEmail',
        roles: ['role3']
      };

      await staticPermissionsPlugin.getPermissionsByUser(mockUser);
      expect(logger.warn).toBeCalledWith('The role role3 does not have permissions mapped');
    });

    itProp('random inputs as user', [fc.anything()], async (user) => {
      try {
        await staticPermissionsPlugin.getPermissionsByUser(user as User);
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
      }
    });
  });
});
