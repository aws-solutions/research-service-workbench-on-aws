/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { MockDynamicAuthorizationService } from '@aws/workbench-core-authorization/lib/mockDynamicAuthorizationService';
import AuthorizationSetup from './authorizationSetup';

describe('AuthorizationSetup', () => {
  test('run: Create new group, assign permissions', async () => {
    const authService = new MockDynamicAuthorizationService();
    authService.createGroup = jest.fn();
    authService.createIdentityPermissions = jest.fn();
    const authSetup = new AuthorizationSetup(authService);

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
