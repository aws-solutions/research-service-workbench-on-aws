/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GroupAlreadyExistsError } from './errors/groupAlreadyExistsError';
import { GroupNotFoundError } from './errors/groupNotFoundError';
import { AssignUserToGroupRequest, AssignUserToGroupResponse } from './models/assignUserToGroup';
import { CreateGroupRequest, CreateGroupResponse } from './models/createGroup';
import {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse
} from './models/createIdentityPermissions';
import { DeleteGroupRequest, DeleteGroupResponse } from './models/deleteGroup';
import {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse
} from './models/deleteIdentityPermissions';
import {
  DeleteSubjectPermissionsRequest,
  DeleteSubjectPermissionsResponse
} from './models/deleteSubjectPermissions';
import {
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityResponse
} from './models/getIdentityPermissionsByIdentity';
import {
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectResponse
} from './models/getIdentityPermissionsBySubject';
import { GetUserGroupsRequest, GetUserGroupsResponse } from './models/getUserGroups';
import { GetUsersFromGroupRequest, GetUsersFromGroupResponse } from './models/getUsersFromGroup';
import { PermissionsService } from './models/permissionsService';
import { RemoveUserFromGroupRequest, RemoveUserFromGroupResponse } from './models/removeUserFromGroup';

export class MockDynamicAuthorizationService implements PermissionsService {
  public createGroup(createGroupRequest: CreateGroupRequest): Promise<CreateGroupResponse> {
    if (createGroupRequest.groupId.includes('existing')) {
      return Promise.reject(new GroupAlreadyExistsError('Group already exists.'));
    }

    return Promise.resolve({ created: true });
  }

  public deleteGroup(deleteGroupRequest: DeleteGroupRequest): Promise<DeleteGroupResponse> {
    return Promise.resolve({ deleted: true });
  }

  public getUserGroups(getUserGroupsRequest: GetUserGroupsRequest): Promise<GetUserGroupsResponse> {
    return Promise.resolve({ groupIds: [] });
  }

  public getUsersFromGroup(
    getUsersFromGroupRequest: GetUsersFromGroupRequest
  ): Promise<GetUsersFromGroupResponse> {
    return Promise.resolve({ userIds: [] });
  }

  public createIdentityPermissions(
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse> {
    return Promise.resolve({ created: true });
  }

  public deleteIdentityPermissions(
    deleteIdentityPermissionsRequest: DeleteIdentityPermissionsRequest
  ): Promise<DeleteIdentityPermissionsResponse> {
    return Promise.resolve({ deleted: true });
  }

  public deleteSubjectPermissions(
    deleteSubjectPermissionsRequest: DeleteSubjectPermissionsRequest
  ): Promise<DeleteSubjectPermissionsResponse> {
    return Promise.resolve({ deleted: true });
  }

  public assignUserToGroup(
    assignUserToGroupRequest: AssignUserToGroupRequest
  ): Promise<AssignUserToGroupResponse> {
    if (assignUserToGroupRequest.groupId.includes('notfound')) {
      return Promise.reject(new GroupNotFoundError('Group does not exist.'));
    }

    return Promise.resolve({ assigned: true });
  }

  public removeUserFromGroup(
    removeUserFromGroupRequest: RemoveUserFromGroupRequest
  ): Promise<RemoveUserFromGroupResponse> {
    return Promise.resolve({ removed: true });
  }

  public getIdentityPermissionsBySubject(
    getIdentityPermissionsBySubjectRequest: GetIdentityPermissionsBySubjectRequest
  ): Promise<GetIdentityPermissionsBySubjectResponse> {
    return Promise.resolve({ identityPermissions: [] });
  }

  public getIdentityPermissionsByIdentity(
    getIdentityPermissionsByIdentityRequest: GetIdentityPermissionsByIdentityRequest
  ): Promise<GetIdentityPermissionsByIdentityResponse> {
    return Promise.resolve({ identityPermissions: [] });
  }
}
