/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditService, BaseAuditPlugin } from '@aws/workbench-core-audit';
import {
  AuthorizationPlugin,
  DynamicAuthorizationPermissionsPlugin,
  DynamicAuthorizationService,
  GroupManagementPlugin,
  GroupAlreadyExistsError,
  IdentityPermissionCreationError
} from '@aws/workbench-core-authorization';
import { SwbAuthZSubject } from '../constants';
import AuthorizationSetup from './authorizationSetup';

describe('AuthorizationSetup', () => {
  let mockGroupManagementPlugin: GroupManagementPlugin;
  let mockDynamicAuthorizationPermissionsPlugin: DynamicAuthorizationPermissionsPlugin;
  let auditService: AuditService;
  let mockAuthorizationPlugin: AuthorizationPlugin;
  let authService: DynamicAuthorizationService;
  let authSetup: AuthorizationSetup;
  beforeEach(() => {
    mockGroupManagementPlugin = {
      createGroup: jest.fn(),
      deleteGroup: jest.fn(),
      getUserGroups: jest.fn(),
      getGroupUsers: jest.fn(),
      addUserToGroup: jest.fn(),
      isUserAssignedToGroup: jest.fn(),
      removeUserFromGroup: jest.fn(),
      getGroupStatus: jest.fn(),
      setGroupStatus: jest.fn(),
      doesGroupExist: jest.fn(),
      validateUserGroups: jest.fn()
    };

    mockDynamicAuthorizationPermissionsPlugin = {
      isRouteIgnored: jest.fn(),
      isRouteProtected: jest.fn(),
      getDynamicOperationsByRoute: jest.fn(),
      createIdentityPermissions: jest.fn(),
      deleteIdentityPermissions: jest.fn(),
      getIdentityPermissionsByIdentity: jest.fn().mockResolvedValue({
        data: {
          identityPermissions: []
        }
      }),
      getIdentityPermissionsBySubject: jest.fn(),
      deleteSubjectIdentityPermissions: jest.fn()
    };

    auditService = new AuditService(
      new BaseAuditPlugin({
        write: jest.fn()
      })
    );

    mockAuthorizationPlugin = {
      isAuthorized: jest.fn(),
      isAuthorizedOnDynamicOperations: jest.fn()
    };

    authService = new DynamicAuthorizationService({
      auditService,
      authorizationPlugin: mockAuthorizationPlugin,
      dynamicAuthorizationPermissionsPlugin: mockDynamicAuthorizationPermissionsPlugin,
      groupManagementPlugin: mockGroupManagementPlugin
    });
    authService.createGroup = jest.fn();
    authService.createIdentityPermissions = jest.fn();
    authSetup = new AuthorizationSetup(authService, { ROOT_USER_EMAIL: 'test' });
  });
  test('run: Create new group, assign permissions', async () => {
    await authSetup.run();

    expect(authService.createGroup).toBeCalledTimes(1);
    expect(authService.createGroup).toBeCalledWith(expect.objectContaining({ groupId: 'ITAdmin' }));

    expect(authService.createIdentityPermissions).toBeCalledTimes(1);
    expect(authService.createIdentityPermissions).toBeCalledWith(
      expect.objectContaining({
        identityPermissions: expect.arrayContaining([
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_PROJECT }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_ENVIRONMENT }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_ENVIRONMENT_TYPE }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_ETC }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_PROJECT_LIST_BY_ETC }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_DATASET }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_USER }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_COST_CENTER }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_AWS_ACCOUNT }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_PROJECT_USER_ASSOCIATION }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_AWS_ACCOUNT_TEMPLATE_URL })
        ])
      })
    );
  });

  test('Should not throw an error if ITAdmin role already exists', async () => {
    authService.createGroup = jest.fn().mockRejectedValue(new GroupAlreadyExistsError());
    await authSetup.run();

    expect(authService.createGroup).toBeCalledTimes(1);
    expect(authService.createGroup).toBeCalledWith(expect.objectContaining({ groupId: 'ITAdmin' }));

    expect(authService.createIdentityPermissions).toBeCalledTimes(1);
    expect(authService.createIdentityPermissions).toBeCalledWith(
      expect.objectContaining({
        identityPermissions: expect.arrayContaining([
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_PROJECT }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_ENVIRONMENT }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_ENVIRONMENT_TYPE }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_ETC }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_PROJECT_LIST_BY_ETC }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_DATASET }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_USER }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_COST_CENTER }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_AWS_ACCOUNT }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_PROJECT_USER_ASSOCIATION }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_AWS_ACCOUNT_TEMPLATE_URL })
        ])
      })
    );
  });

  test('Should not throw an error if ITAdmin identity permissions already exists', async () => {
    authService.createIdentityPermissions = jest
      .fn()
      .mockRejectedValue(new IdentityPermissionCreationError());
    await authSetup.run();

    expect(authService.createGroup).toBeCalledTimes(1);
    expect(authService.createGroup).toBeCalledWith(expect.objectContaining({ groupId: 'ITAdmin' }));

    expect(authService.createIdentityPermissions).toBeCalledTimes(1);
    expect(authService.createIdentityPermissions).toBeCalledWith(
      expect.objectContaining({
        identityPermissions: expect.arrayContaining([
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_PROJECT }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_ENVIRONMENT }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_ENVIRONMENT_TYPE }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_ETC }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_PROJECT_LIST_BY_ETC }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_DATASET }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_USER }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_COST_CENTER }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_AWS_ACCOUNT }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_PROJECT_USER_ASSOCIATION }),
          expect.objectContaining({ subjectType: SwbAuthZSubject.SWB_AWS_ACCOUNT_TEMPLATE_URL })
        ])
      })
    );
  });

  test('Non GroupAlreadyExistsError should be thrown', async () => {
    authService.createGroup = jest.fn().mockRejectedValue(new Error());
    await expect(authSetup.run()).rejects.toThrow(Error);
  });

  test('Non IdentityPermissionCreationError should be thrown', async () => {
    authService.createIdentityPermissions = jest.fn().mockRejectedValue(new Error());
    await expect(authSetup.run()).rejects.toThrow(Error);
  });
});
