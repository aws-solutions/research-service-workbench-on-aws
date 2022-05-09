import { User } from '@amzn/workbench-core-authentication';
import { LoggingService } from '@amzn/workbench-core-logging';
import { fc, itProp } from 'jest-fast-check';
import { PermissionsMap } from '.';
import { Action } from './action';
import { Permission } from './permissionsPlugin';
import StaticPermissionsPlugin from './staticPermissionsPlugin';

describe('StaticPermissionsPlugin', () => {
  let staticPermissionsPlugin: StaticPermissionsPlugin;
  let mockPermissionsMap: PermissionsMap;
  let mockUser: User;
  let role1Permissions: Permission[];
  let role2Permissions: Permission[];
  let logger: LoggingService;
  beforeEach(() => {
    role1Permissions = [
      {
        effect: 'ALLOW',
        action: Action.UPDATE,
        subject: 'Sample'
      },
      {
        effect: 'ALLOW',
        action: Action.READ,
        subject: 'Sample'
      }
    ];
    role2Permissions = [
      {
        effect: 'ALLOW',
        action: Action.CREATE,
        subject: 'Sample2'
      },
      {
        effect: 'DENY',
        action: Action.DELETE,
        subject: 'Sample2'
      }
    ];
    mockPermissionsMap = {
      role1: role1Permissions,
      role2: role2Permissions
    };
    logger = new LoggingService();
    jest.spyOn(logger, 'warn');
    staticPermissionsPlugin = new StaticPermissionsPlugin(mockPermissionsMap, logger);
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
