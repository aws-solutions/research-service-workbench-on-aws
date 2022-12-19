/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GroupAlreadyExistsError } from './errors/groupAlreadyExistsError';
import { GroupNotFoundError } from './errors/groupNotFoundError';
import { MockDynamicAuthorizationService } from './mockDynamicAuthorizationService';
import { AssignUserToGroupRequest } from './models/assignUserToGroup';
import { CreateGroupRequest } from './models/createGroup';
import { CreateIdentityPermissionsRequest } from './models/createIdentityPermissions';
import { DeleteGroupRequest } from './models/deleteGroup';
import { DeleteIdentityPermissionsRequest } from './models/deleteIdentityPermissions';
import { DeleteSubjectPermissionsRequest } from './models/deleteSubjectPermissions';
import { GetIdentityPermissionsByIdentityRequest } from './models/getIdentityPermissionsByIdentity';
import { GetIdentityPermissionsBySubjectRequest } from './models/getIdentityPermissionsBySubject';
import { GetUserGroupsRequest } from './models/getUserGroups';
import { GetUsersFromGroupRequest } from './models/getUsersFromGroup';
import { RemoveUserFromGroupRequest } from './models/removeUserFromGroup';

describe('Mock Dynamic Authorization Service', () => {
  let authorizationService: MockDynamicAuthorizationService;
  beforeEach(() => {
    authorizationService = new MockDynamicAuthorizationService();
  });

  test('createGroup', async () => {
    const request: CreateGroupRequest = { groupId: 'groupId' };

    const response = await authorizationService.createGroup(request);

    expect(response.created).toBe(true);
  });

  test('createGroup throws error when creating existing group', async () => {
    await expect(async () => {
      const request: CreateGroupRequest = { groupId: 'existingGroup' };

      await authorizationService.createGroup(request);
    }).rejects.toThrow(GroupAlreadyExistsError);
  });

  test('deleteGroup', async () => {
    const request: DeleteGroupRequest = { groupId: 'groupId' };

    const response = await authorizationService.deleteGroup(request);

    expect(response.deleted).toBe(true);
  });

  test('getUserGroups', async () => {
    const request: GetUserGroupsRequest = { userId: 'userId' };

    const response = await authorizationService.getUserGroups(request);

    expect(response.groupIds).toEqual([]);
  });

  test('getUsersFromGroup', async () => {
    const request: GetUsersFromGroupRequest = { groupId: 'groupId' };

    const response = await authorizationService.getUsersFromGroup(request);

    expect(response.userIds).toEqual([]);
  });

  test('assignUserToGroup', async () => {
    const request: AssignUserToGroupRequest = { userId: 'userId', groupId: 'groupId' };

    const response = await authorizationService.assignUserToGroup(request);

    expect(response.assigned).toBe(true);
  });

  test('assignUserToGroup', async () => {
    await expect(async () => {
      const request: AssignUserToGroupRequest = { userId: 'userId', groupId: 'notfoundgroup' };

      await authorizationService.assignUserToGroup(request);
    }).rejects.toThrow(GroupNotFoundError);
  });

  test('removeUserFromGroup', async () => {
    const request: RemoveUserFromGroupRequest = { userId: 'userId', groupId: 'groupId' };

    const response = await authorizationService.removeUserFromGroup(request);

    expect(response.removed).toBe(true);
  });

  test('createIdentityPermissions', async () => {
    const request: CreateIdentityPermissionsRequest = { identityPermissions: [] };

    const response = await authorizationService.createIdentityPermissions(request);

    expect(response.created).toBe(true);
  });

  test('deleteIdentityPermissions', async () => {
    const request: DeleteIdentityPermissionsRequest = { identityPermissions: [] };

    const response = await authorizationService.deleteIdentityPermissions(request);

    expect(response.deleted).toBe(true);
  });

  test('deleteSubjectPermissions', async () => {
    const request: DeleteSubjectPermissionsRequest = { subjectId: 'subjectId', subjectType: 'subjectType' };

    const response = await authorizationService.deleteSubjectPermissions(request);

    expect(response.deleted).toBe(true);
  });

  test('getIdentityPermissionsBySubject', async () => {
    const request: GetIdentityPermissionsBySubjectRequest = {
      subjectId: 'subjectId',
      subjectType: 'subjectType'
    };

    const response = await authorizationService.getIdentityPermissionsBySubject(request);

    expect(response.identityPermissions).toEqual([]);
  });

  test('getIdentityPermissionsByIdentity', async () => {
    const request: GetIdentityPermissionsByIdentityRequest = { identityId: 'identity', identityType: 'USER' };

    const response = await authorizationService.getIdentityPermissionsByIdentity(request);

    expect(response.identityPermissions).toEqual([]);
  });
});
