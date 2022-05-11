import { ForbiddenError } from '@casl/ability';
import { Action, Operation, Permission, CASLAuthorizationPlugin } from '.';
import { fc, itProp } from 'jest-fast-check';

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
      expect(
        await caslAuthorizationPlugin.isAuthorized(mockAdminPermissions, mockOperations)
      ).toBeUndefined();
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
      expect(
        await caslAuthorizationPlugin.isAuthorized(mockAdminPermissions, mockOperations)
      ).toBeUndefined();
    });

    test('unauthorized user with action and subject not listed in the permissions', async () => {
      const testSubject = 'DoesNotExist';
      const testAction = Action.READ;
      mockOperations = [
        {
          action: testAction,
          subject: testSubject,
          field: 'id'
        }
      ];
      try {
        await caslAuthorizationPlugin.isAuthorized(mockAdminPermissions, mockOperations);
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenError);
        expect(err.message).toBe(`Cannot execute "${testAction}" on "${testSubject}"`);
      }
    });

    test('authorized with no action', async () => {
      mockOperations = [];
      expect(
        await caslAuthorizationPlugin.isAuthorized(mockAdminPermissions, mockOperations)
      ).toBeUndefined();
    });

    itProp(
      'Random array should throw error',
      [fc.uniqueArray(fc.anything()), fc.uniqueArray(fc.anything(), { minLength: 1 })],
      async (userPermissions, operations) => {
        try {
          await caslAuthorizationPlugin.isAuthorized(
            userPermissions as Permission[],
            operations as Operation[]
          );
          expect.hasAssertions();
        } catch (err) {
          // eslint-disable-next-line no-empty
        }
      }
    );
  });
});
