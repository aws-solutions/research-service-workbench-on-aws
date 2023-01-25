/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin } from '@aws/workbench-core-audit';
import { DynamicAuthorizationService } from '@aws/workbench-core-authorization';
import AuthorizationSetup from './authorizationSetup';

describe('AuthorizationSetup', () => {
  test('run: Create new group, assign permissions', async () => {
    const mockGroupManagementPlugin = {
      createGroup: jest.fn(),
      deleteGroup: jest.fn(),
      getUserGroups: jest.fn(),
      getGroupUsers: jest.fn(),
      addUserToGroup: jest.fn(),
      isUserAssignedToGroup: jest.fn(),
      removeUserFromGroup: jest.fn(),
      getGroupStatus: jest.fn(),
      setGroupStatus: jest.fn()
    };

    const mockDynamicAuthorizationPermissionsPlugin = {
      isRouteIgnored: jest.fn(),
      isRouteProtected: jest.fn(),
      getDynamicOperationsByRoute: jest.fn(),
      createIdentityPermissions: jest.fn(),
      deleteIdentityPermissions: jest.fn(),
      getIdentityPermissionsByIdentity: jest.fn(),
      getIdentityPermissionsBySubject: jest.fn(),
      deleteSubjectIdentityPermissions: jest.fn()
    };

    const auditService = new AuditService(
      new BaseAuditPlugin({
        write: jest.fn()
      })
    );

    const mockAuthorizationPlugin = {
      isAuthorized: jest.fn(),
      isAuthorizedOnDynamicOperations: jest.fn()
    };

    const authService = new DynamicAuthorizationService({
      auditService,
      authorizationPlugin: mockAuthorizationPlugin,
      dynamicAuthorizationPermissionsPlugin: mockDynamicAuthorizationPermissionsPlugin,
      groupManagementPlugin: mockGroupManagementPlugin
    });
    authService.createGroup = jest.fn();
    authService.createIdentityPermissions = jest.fn();
    const authSetup = new AuthorizationSetup(authService, { ROOT_USER_EMAIL: 'test' });

    await authSetup.run();

    expect(authService.createGroup).toBeCalledTimes(1);
    expect(authService.createGroup).toBeCalledWith(expect.objectContaining({ groupId: 'ITAdmin' }));

    expect(authService.createIdentityPermissions).toBeCalledTimes(1);
    expect(authService.createIdentityPermissions).toBeCalledWith(
      expect.objectContaining({
        identityPermissions: expect.arrayContaining([
          expect.objectContaining({ subjectType: 'Project' }),
          expect.objectContaining({ subjectType: 'EnvType' }),
          expect.objectContaining({ subjectType: 'ExternalDataset' }),
          expect.objectContaining({ subjectType: 'User' }),
          expect.objectContaining({ subjectType: 'CostCenter' }),
          expect.objectContaining({ subjectType: 'AwsAccount' }),
          expect.objectContaining({ subjectType: 'Group | groupId' })
        ])
      })
    );
  });
});
