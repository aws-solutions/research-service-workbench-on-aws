/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AssignUserToGroupRequest,
  AssignUserToGroupResponse
} from './dynamicPermissionsPluginInputs/assignUserToGroup';
import { CreateGroupRequest, CreateGroupResponse } from './dynamicPermissionsPluginInputs/createGroup';
import {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse
} from './dynamicPermissionsPluginInputs/createIdentityPermissions';
import { DeleteGroupRequest, DeleteGroupResponse } from './dynamicPermissionsPluginInputs/deleteGroup';
import {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse
} from './dynamicPermissionsPluginInputs/deleteIdentityPermissions';
import {
  DeleteSubjectPermissionsRequest,
  DeleteSubjectPermissionsResponse
} from './dynamicPermissionsPluginInputs/deleteSubjectPermissions';
import {
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityResponse
} from './dynamicPermissionsPluginInputs/getIdentityPermissionsByIdentity';
import {
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectResponse
} from './dynamicPermissionsPluginInputs/getIdentityPermissionsBySubject';
import { GetUserGroupsRequest, GetUserGroupsResponse } from './dynamicPermissionsPluginInputs/getUserGroups';
import {
  GetUsersFromGroupRequest,
  GetUsersFromGroupResponse
} from './dynamicPermissionsPluginInputs/getUsersFromGroup';
import {
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse
} from './dynamicPermissionsPluginInputs/removeUserFromGroup';

export interface DynamicPermissionsPlugin {
  /**
   * Create an authorization group
   * @param createGroupRequest - {@link CreateGroupRequest}
   *
   * @returns - {@link CreateGroupResponse}
   *
   * @throws - {@link GroupAlreadyExistsError} Can not create a group that already exists
   */
  createGroup(createGroupRequest: CreateGroupRequest): Promise<CreateGroupResponse>;

  /**
   * Delete an authorization group
   * @param deleteGroupRequest - {@link DeleteGroupRequest}
   *
   * @returns - {@link DeleteGroupResponse}
   */
  deleteGroup(deleteGroupRequest: DeleteGroupRequest): Promise<DeleteGroupResponse>;

  /**
   * Get all groups associated to the user
   * @param getUserGroupsRequest - {@link GetUserGroupsRequest}
   *
   * @returns - {@link GetUserGroupsResponse}
   */
  getUserGroups(getUserGroupsRequest: GetUserGroupsRequest): Promise<GetUserGroupsResponse>;

  /**
   * Get all users associated to the group
   * @param getUsersFromGroupRequest - {@link GetUserGroupsRequest}
   *
   * @returns - {@link GetUsersFromGroupResponse}
   */
  getUsersFromGroup(getUsersFromGroupRequest: GetUsersFromGroupRequest): Promise<GetUsersFromGroupResponse>;
  /**
   * Create an identity permission.
   * An Identity permissions associates a user/group to a {@link Permission} and subjectId
   * @param createIdentityPermissionsRequest - {@link CreateIdentityPermissionsRequest}
   *
   * @returns - {@link CreateIdentityPermissionsRequest}
   *
   * @throws - {@link IdentityPermissionAlreadyExistsError} Can not create an identity permission that already exists.
   */
  createIdentityPermissions(
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse>;

  /**
   * Delete an identity permission
   * @param deleteIdentityPermissionsRequest - {@link DeleteIdentityPermissionsRequest}
   *
   * @returns - {@link DeleteIdentityPermissionsResponse}
   */
  deleteIdentityPermissions(
    deleteIdentityPermissionsRequest: DeleteIdentityPermissionsRequest
  ): Promise<DeleteIdentityPermissionsResponse>;

  /**
   * Delete all identity permissions associated with the subject and subjectId
   * @param deleteSubjectPermissionsRequest - {@link DeleteSubjectPermissionsRequest}
   *
   */
  deleteSubjectPermissions(
    deleteSubjectPermissionsRequest: DeleteSubjectPermissionsRequest
  ): Promise<DeleteSubjectPermissionsResponse>;
  /**
   * Assign user to a group
   * @param assignUserToGroupRequest - {@link AssignUserToGroupRequest}
   *
   * @returns - {@link AssignUserToGroupResponse}
   *
   * @throws - {@link GroupDoesNotExist} Assigned group does not
   */
  assignUserToGroup(assignUserToGroupRequest: AssignUserToGroupRequest): Promise<AssignUserToGroupResponse>;

  /**
   * Remove user from group
   * @param removeUserFromGroupRequest - {@link RemoveUserFromGroupRequest}
   *
   * @returns - {@link RemoveUserFromGroupResponse}
   */
  removeUserFromGroup(
    removeUserFromGroupRequest: RemoveUserFromGroupRequest
  ): Promise<RemoveUserFromGroupResponse>;

  /**
   * Get all {@link IdentityPermission}s associated to the subject
   * @param getIdentityPermissionsBySubjectRequest - {@link GetIdentityPermissionsBySubjectRequest}
   *
   * @returns - {@link GetIdentityPermissionsBySubjectResponse}
   */
  getIdentityPermissionsBySubject(
    getIdentityPermissionsBySubjectRequest: GetIdentityPermissionsBySubjectRequest
  ): Promise<GetIdentityPermissionsBySubjectResponse>;

  /**
   * Get {@link IdentityPermission}s associated to the identity
   * @param getIdentityPermissionsByIdentityRequest - {@link GetIdentityPermissionsByIdentityRequest}
   *
   * @returns - {@link GetIdentityPermissionsByIdentityResponse}
   */
  getIdentityPermissionsByIdentity(
    getIdentityPermissionsByIdentityRequest: GetIdentityPermissionsByIdentityRequest
  ): Promise<GetIdentityPermissionsByIdentityResponse>;
}
