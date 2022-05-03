import { ForbiddenError } from '@casl/ability';
import CASLAuthorizationPlugin from './caslAuthorizationPlugin';
import { Action, Operation, Permission } from '.';

describe('CASL Authorization Plugin', () => {
  let caslAuthorizationPlugin: CASLAuthorizationPlugin;
  let mockAdminPermissions: Permission[];
  let mockGuestPermissions: Permission[];
  let mockOperations: Operation[];

  describe('isAuthorized', () => {
    beforeEach(() => {
      mockAdminPermissions = [
        {
          action: Action.UPDATE,
          subject: 'Sample',
          effect: 'ALLOW'
        },
        {
          action: Action.READ,
          subject: 'Sample',
          effect: 'ALLOW',
          fields: ['name', 'id']
        }
      ];
      mockGuestPermissions = [
        {
          action: Action.READ,
          subject: 'Sample',
          effect: 'ALLOW',
          fields: ['name']
        },
        {
          action: Action.READ,
          subject: 'Sample',
          effect: 'DENY',
          fields: ['id']
        },
        {
          action: Action.UPDATE,
          subject: 'Sample',
          effect: 'DENY',
          reason: 'User is not capable of updating'
        }
      ];

      caslAuthorizationPlugin = new CASLAuthorizationPlugin();
    });
    test('unauthorized user with action and subject should throws ForbiddenError with reason', async () => {
      mockOperations = [
        {
          action: Action.UPDATE,
          subject: 'Sample'
        }
      ];
      try {
        await caslAuthorizationPlugin.isAuthorized(mockGuestPermissions, mockOperations);
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenError);
        expect(err.message).toBe('User is not capable of updating');
      }
    });
    test('authorized user with action and subject', async () => {
      mockOperations = [
        {
          action: Action.UPDATE,
          subject: 'Sample'
        }
      ];
      const authorized = await caslAuthorizationPlugin.isAuthorized(mockAdminPermissions, mockOperations);
      expect(authorized).toBe(true);
    });

    test('unauthorized user with action, subject, and field, should throw ForbiddenError', async () => {
      mockOperations = [
        {
          action: Action.READ,
          subject: 'Sample',
          field: 'id'
        }
      ];
      try {
        await caslAuthorizationPlugin.isAuthorized(mockGuestPermissions, mockOperations);
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenError);
        expect(err.message).toBe('Permission Not Granted');
      }
    });

    test('authorized user with action, subject, and field', async () => {
      mockOperations = [
        {
          action: Action.READ,
          subject: 'Sample',
          field: 'id'
        },
        {
          action: Action.READ,
          subject: 'Sample',
          field: 'name'
        }
      ];
      const authorized = await caslAuthorizationPlugin.isAuthorized(mockAdminPermissions, mockOperations);
      expect(authorized).toBe(true);
    });
  });
});
