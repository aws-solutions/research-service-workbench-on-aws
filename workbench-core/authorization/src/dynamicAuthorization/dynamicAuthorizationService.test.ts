/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  IdentityPermission,
  DynamicPermissionsPlugin,
  DynamicAuthorizationService,
  DynamicOperation,
  ForbiddenError,
  AuthorizationPlugin,
  AuthenticatedUser
} from '../';

describe('Dynamic Authorization Service', () => {
  let dynamicAuthorizationService: DynamicAuthorizationService;
  let mockAuthorizationPlugin: AuthorizationPlugin;
  let mockDynamicPermissionsPlugin: DynamicPermissionsPlugin;
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthorizationPlugin = {
      isAuthorized: jest.fn(),
      isAuthorizedOnDynamicOperations: jest.fn()
    };
    mockDynamicPermissionsPlugin = {
      createGroup: jest.fn(),
      deleteGroup: jest.fn(),
      getUserGroups: jest.fn(),
      getUsersFromGroup: jest.fn(),
      assignUserToGroup: jest.fn(),
      removeUserFromGroup: jest.fn(),
      createIdentityPermissions: jest.fn(),
      deleteIdentityPermissions: jest.fn(),
      deleteSubjectPermissions: jest.fn(),
      getIdentityPermissionsByIdentity: jest.fn(),
      getIdentityPermissionsBySubject: jest.fn()
    };
    dynamicAuthorizationService = new DynamicAuthorizationService({
      dynamicPermissionsPlugin: mockDynamicPermissionsPlugin,
      authorizationPlugin: mockAuthorizationPlugin
    });
  });

  describe('isAuthorizedOnSubject', () => {
    const mockAuthenticatedUser: AuthenticatedUser = {
      id: 'sampleId',
      roles: ['groupId0']
    };
    const groupIds = ['groupId1'];
    const sampleGroupPermissions: IdentityPermission[] = [
      {
        effect: 'ALLOW',
        action: 'READ',
        subjectType: 'sampleSubject',
        subjectId: 'sampleSubjectId',
        identityType: 'GROUP',
        identityId: 'groupId1'
      }
    ];
    const sampleGroupWildcardPermissions: IdentityPermission[] = [
      {
        effect: 'ALLOW',
        action: 'READ',
        subjectType: 'sampleSubject',
        subjectId: '*',
        identityType: 'GROUP',
        identityId: 'groupId1'
      }
    ];

    const mockDynamicOperation: DynamicOperation = {
      action: 'READ',
      subjectType: 'sampleSubject',
      subjectId: 'sampleSubjectId'
    };
    beforeEach(() => {
      jest.spyOn(mockDynamicPermissionsPlugin, 'getUserGroups').mockResolvedValueOnce({
        groupIds
      });

      jest.spyOn(mockDynamicPermissionsPlugin, 'getIdentityPermissionsBySubject').mockResolvedValueOnce({
        identityPermissions: sampleGroupPermissions
      });

      jest.spyOn(mockDynamicPermissionsPlugin, 'getIdentityPermissionsBySubject').mockResolvedValueOnce({
        identityPermissions: sampleGroupWildcardPermissions
      });
    });

    test('Check user with a valid permissions for a dynamic operation', async () => {
      expect(
        async () =>
          await dynamicAuthorizationService.isAuthorizedOnSubject(mockAuthenticatedUser, {
            dynamicOperation: mockDynamicOperation
          })
      ).not.toThrowError();
    });

    test('Check user with invalid permissions for a dynamic operation', async () => {
      jest
        .spyOn(mockAuthorizationPlugin, 'isAuthorizedOnDynamicOperations')
        .mockRejectedValue(new ForbiddenError('User cannot access'));
      try {
        await dynamicAuthorizationService.isAuthorizedOnSubject(mockAuthenticatedUser, {
          dynamicOperation: mockDynamicOperation
        });
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenError);
        expect(err.message).toBe('User cannot access');
      }
    });

    test('No values returned for permissions for a dynamic operation', async () => {
      jest.resetAllMocks();
      jest.spyOn(mockDynamicPermissionsPlugin, 'getUserGroups').mockResolvedValueOnce({
        groupIds: []
      });

      jest.spyOn(mockDynamicPermissionsPlugin, 'getIdentityPermissionsBySubject').mockResolvedValueOnce({
        identityPermissions: []
      });

      jest.spyOn(mockDynamicPermissionsPlugin, 'getIdentityPermissionsBySubject').mockResolvedValueOnce({
        identityPermissions: []
      });
      jest
        .spyOn(mockAuthorizationPlugin, 'isAuthorizedOnDynamicOperations')
        .mockRejectedValue(new ForbiddenError('User cannot access'));
      try {
        await dynamicAuthorizationService.isAuthorizedOnSubject(mockAuthenticatedUser, {
          dynamicOperation: mockDynamicOperation
        });
        expect.hasAssertions();
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenError);
        expect(err.message).toBe('User cannot access');
      }
    });
  });
  test('createGroup', async () => {
    jest.spyOn(mockDynamicPermissionsPlugin, 'createGroup').mockResolvedValue({ created: true });
    expect(
      await dynamicAuthorizationService.createGroup({
        groupId: 'sampleId',
        description: 'sample description'
      })
    ).toStrictEqual({
      created: true
    });
  });
  test('deleteGroup', async () => {
    jest.spyOn(mockDynamicPermissionsPlugin, 'deleteGroup').mockResolvedValue({ deleted: true });
    expect(
      await dynamicAuthorizationService.deleteGroup({
        groupId: 'sampleId'
      })
    ).toStrictEqual({
      deleted: true
    });
  });
  test('createIdentityPermissions', async () => {
    jest
      .spyOn(mockDynamicPermissionsPlugin, 'createIdentityPermissions')
      .mockResolvedValue({ created: true });
    const mockIdentityPermission: IdentityPermission = {
      effect: 'ALLOW',
      action: 'CREATE',
      subjectType: 'sampleSubject',
      subjectId: 'sampleSubject123',
      identityType: 'GROUP',
      identityId: 'groupId'
    };
    expect(
      await dynamicAuthorizationService.createIdentityPermissions({
        identityPermissions: [mockIdentityPermission]
      })
    ).toStrictEqual({
      created: true
    });
  });
  test('deleteIdentityPermissions', async () => {
    jest
      .spyOn(mockDynamicPermissionsPlugin, 'deleteIdentityPermissions')
      .mockResolvedValue({ deleted: true });
    const mockIdentityPermission: IdentityPermission = {
      effect: 'ALLOW',
      action: 'CREATE',
      subjectType: 'sampleSubject',
      subjectId: 'sampleSubject123',
      identityType: 'GROUP',
      identityId: 'groupId'
    };
    expect(
      await dynamicAuthorizationService.deleteIdentityPermissions({
        identityPermissions: [mockIdentityPermission]
      })
    ).toStrictEqual({
      deleted: true
    });
  });
  test('deleteSubjectPermissions', async () => {
    jest.spyOn(mockDynamicPermissionsPlugin, 'deleteSubjectPermissions').mockResolvedValue({ deleted: true });
    expect(
      await dynamicAuthorizationService.deleteSubjectPermissions({
        subjectId: 'sampleId',
        subjectType: 'sampleSubject'
      })
    ).toStrictEqual({
      deleted: true
    });
    expect(mockDynamicPermissionsPlugin.deleteSubjectPermissions).toBeCalledWith({
      subjectId: 'sampleId',
      subjectType: 'sampleSubject'
    });
  });
  test('assignUserToGroup', async () => {
    jest.spyOn(mockDynamicPermissionsPlugin, 'assignUserToGroup').mockResolvedValue({ assigned: true });
    expect(
      await dynamicAuthorizationService.assignUserToGroup({
        userId: 'userId0',
        groupId: 'groupId0'
      })
    ).toStrictEqual({
      assigned: true
    });
  });
  test('removeUserFromGroup', async () => {
    jest.spyOn(mockDynamicPermissionsPlugin, 'removeUserFromGroup').mockResolvedValue({ removed: true });
    expect(
      await dynamicAuthorizationService.removeUserFromGroup({
        userId: 'userId0',
        groupId: 'groupId0'
      })
    ).toStrictEqual({
      removed: true
    });
  });
  test('getUsersFromGroup', async () => {
    jest.spyOn(mockDynamicPermissionsPlugin, 'getUsersFromGroup').mockResolvedValue({ userIds: ['userId0'] });
    expect(
      await dynamicAuthorizationService.getUsersFromGroup({
        groupId: 'groupId0'
      })
    ).toStrictEqual({
      userIds: ['userId0']
    });
  });
  test('Check for dynamic permissions plugin was called', async () => {
    jest.spyOn(mockDynamicPermissionsPlugin, 'getUserGroups').mockResolvedValue({ groupIds: ['groupId0'] });
    expect(
      await dynamicAuthorizationService.getUserGroups({
        userId: 'userId0'
      })
    ).toStrictEqual({
      groupIds: ['groupId0']
    });
  });
});
