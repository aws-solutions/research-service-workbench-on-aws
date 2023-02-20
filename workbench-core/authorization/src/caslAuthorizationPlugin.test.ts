/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { fc, itProp } from 'jest-fast-check';
import {
  Operation,
  Permission,
  CASLAuthorizationPlugin,
  ForbiddenError,
  IdentityPermission,
  DynamicOperation
} from '.';

describe('CASL Authorization Plugin', () => {
  let caslAuthorizationPlugin: CASLAuthorizationPlugin;
  let mockAdminPermissions: Permission[];
  let mockGuestPermissions: Permission[];
  let mockOperations: Operation[];

  beforeEach(() => {
    expect.hasAssertions();
  });

  describe('isAuthorized', () => {
    beforeEach(() => {
      mockAdminPermissions = [
        {
          action: 'UPDATE',
          subject: 'Sample',
          effect: 'ALLOW'
        },
        {
          action: 'READ',
          subject: 'Sample',
          effect: 'ALLOW',
          fields: ['name', 'id']
        }
      ];
      mockGuestPermissions = [
        {
          action: 'READ',
          subject: 'Sample',
          effect: 'ALLOW',
          fields: ['name']
        },
        {
          action: 'READ',
          subject: 'Sample',
          effect: 'DENY',
          fields: ['id']
        },
        {
          action: 'UPDATE',
          subject: 'Sample',
          effect: 'DENY',
          reason: 'User is not capable of updating'
        },
        {
          action: 'UPDATE',
          subject: 'Sample',
          effect: 'ALLOW'
        }
      ];

      caslAuthorizationPlugin = new CASLAuthorizationPlugin();
    });
    test('Ensure DENY takes precedence, unauthorized user with action and subject should throws ForbiddenError with reason', async () => {
      mockOperations = [
        {
          action: 'UPDATE',
          subject: 'Sample'
        }
      ];

      await expect(
        caslAuthorizationPlugin.isAuthorized(mockGuestPermissions, mockOperations)
      ).rejects.toThrowError(new ForbiddenError('User is not capable of updating'));
    });
    test('authorized user with action and subject', async () => {
      mockOperations = [
        {
          action: 'UPDATE',
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
          action: 'READ',
          subject: 'Sample',
          field: 'id'
        }
      ];
      await expect(
        caslAuthorizationPlugin.isAuthorized(mockGuestPermissions, mockOperations)
      ).rejects.toThrowError(new ForbiddenError('Permission Not Granted'));
    });

    test('authorized user with action, subject, and field', async () => {
      mockOperations = [
        {
          action: 'READ',
          subject: 'Sample',
          field: 'id'
        },
        {
          action: 'READ',
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
      const testAction = 'READ';
      mockOperations = [
        {
          action: testAction,
          subject: testSubject,
          field: 'id'
        }
      ];

      await expect(
        caslAuthorizationPlugin.isAuthorized(mockGuestPermissions, mockOperations)
      ).rejects.toThrowError(new ForbiddenError(`Cannot execute "${testAction}" on "${testSubject}"`));
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
        await expect(
          caslAuthorizationPlugin.isAuthorized(userPermissions as Permission[], operations as Operation[])
        ).rejects.toThrow();
      }
    );
  });

  describe('isAuthorizedOnDynamicOperations', () => {
    let mockIdentityPermissions: IdentityPermission[];
    beforeEach(() => {
      mockIdentityPermissions = [
        {
          effect: 'ALLOW',
          action: 'CREATE',
          identityType: 'GROUP',
          identityId: 'SampleGroup',
          subjectType: 'SampleSubject',
          subjectId: '*',
          conditions: { env: { $eq: 'SampleEnv' } }
        },
        {
          effect: 'DENY',
          action: 'UPDATE',
          identityType: 'GROUP',
          identityId: 'SampleGroup',
          subjectType: 'SampleSubject',
          subjectId: '1234'
        },
        {
          effect: 'ALLOW',
          action: 'UPDATE',
          identityType: 'GROUP',
          identityId: 'SampleGroup',
          subjectType: 'SampleSubject',
          subjectId: '1234'
        },
        {
          effect: 'DENY',
          action: 'DELETE',
          identityType: 'GROUP',
          identityId: 'SampleGroup',
          subjectType: 'SampleSubject',
          subjectId: '*',
          conditions: { env: { $eq: 'SampleEnv' } }
        }
      ];
      caslAuthorizationPlugin = new CASLAuthorizationPlugin();
    });
    test('Check for valid dynamic operations with valid conditions', async () => {
      const mockDynamicOperations: DynamicOperation[] = [
        {
          action: 'CREATE',
          subject: {
            subjectType: 'SampleSubject',
            subjectId: '1',
            env: 'SampleEnv'
          }
        }
      ];
      expect(
        async () =>
          await caslAuthorizationPlugin.isAuthorizedOnDynamicOperations(
            mockIdentityPermissions,
            mockDynamicOperations
          )
      ).not.toThrow(ForbiddenError);
    });

    test('Check for an invalid dynamic operations due invalid conditions', async () => {
      const mockDynamicOperations: DynamicOperation[] = [
        {
          action: 'CREATE',
          subject: {
            subjectType: 'SampleSubject',
            subjectId: '1'
          }
        }
      ];

      await expect(
        caslAuthorizationPlugin.isAuthorizedOnDynamicOperations(
          mockIdentityPermissions,
          mockDynamicOperations
        )
      ).rejects.toThrow(new ForbiddenError('Cannot execute "CREATE" on "SampleSubject"'));
    });
    test('Check for valid dynamic operations with invalid conditions due to DENY', async () => {
      const mockDynamicOperations: DynamicOperation[] = [
        {
          action: 'DELETE',
          subject: {
            subjectType: 'SampleSubject',
            subjectId: '1234',
            env: 'SampleEnv'
          }
        }
      ];
      await expect(
        caslAuthorizationPlugin.isAuthorizedOnDynamicOperations(
          mockIdentityPermissions,
          mockDynamicOperations
        )
      ).rejects.toThrow(ForbiddenError);
    });
    test('Ensure DENY takes precedence', async () => {
      const mockDynamicOperations: DynamicOperation[] = [
        {
          action: 'UPDATE',
          subject: {
            subjectType: 'SampleSubject',
            subjectId: '1234'
          }
        }
      ];

      await expect(
        caslAuthorizationPlugin.isAuthorizedOnDynamicOperations(
          mockIdentityPermissions,
          mockDynamicOperations
        )
      ).rejects.toThrow(new ForbiddenError('Cannot execute "UPDATE" on "SampleSubject"'));
    });
  });
});
