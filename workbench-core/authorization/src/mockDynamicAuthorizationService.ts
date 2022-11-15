/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

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
import { DynamicPermissionsPlugin } from './models/dynamicPermissionsPlugin';
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
import { RemoveUserFromGroupRequest, RemoveUserFromGroupResponse } from './models/removeUserFromGroup';

export class MockDynamicAuthorizationService implements DynamicPermissionsPlugin {
  public createGroup(createGroupRequest: CreateGroupRequest): Promise<CreateGroupResponse> {
    throw new Error('Method not implemented.');
  }

  public deleteGroup(deleteGroupRequest: DeleteGroupRequest): Promise<DeleteGroupResponse> {
    throw new Error('Method not implemented.');
  }

  public getUserGroups(getUserGroupsRequest: GetUserGroupsRequest): Promise<GetUserGroupsResponse> {
    throw new Error('Method not implemented.');
  }

  public getUsersFromGroup(
    getUsersFromGroupRequest: GetUsersFromGroupRequest
  ): Promise<GetUsersFromGroupResponse> {
    throw new Error('Method not implemented.');
  }

  public createIdentityPermissions(
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse> {
    throw new Error('Method not implemented.');
  }

  public deleteIdentityPermissions(
    deleteIdentityPermissionsRequest: DeleteIdentityPermissionsRequest
  ): Promise<DeleteIdentityPermissionsResponse> {
    throw new Error('Method not implemented.');
  }

  public deleteSubjectPermissions(
    deleteSubjectPermissionsRequest: DeleteSubjectPermissionsRequest
  ): Promise<DeleteSubjectPermissionsResponse> {
    throw new Error('Method not implemented.');
  }

  public assignUserToGroup(
    assignUserToGroupRequest: AssignUserToGroupRequest
  ): Promise<AssignUserToGroupResponse> {
    throw new Error('Method not implemented.');
  }

  public removeUserFromGroup(
    removeUserFromGroupRequest: RemoveUserFromGroupRequest
  ): Promise<RemoveUserFromGroupResponse> {
    throw new Error('Method not implemented.');
  }

  public getIdentityPermissionsBySubject(
    getIdentityPermissionsBySubjectRequest: GetIdentityPermissionsBySubjectRequest
  ): Promise<GetIdentityPermissionsBySubjectResponse> {
    throw new Error('Method not implemented.');
  }

  public getIdentityPermissionsByIdentity(
    getIdentityPermissionsByIdentityRequest: GetIdentityPermissionsByIdentityRequest
  ): Promise<GetIdentityPermissionsByIdentityResponse> {
    throw new Error('Method not implemented.');
  }
}
