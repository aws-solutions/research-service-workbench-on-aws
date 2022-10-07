import {
  AssignUserToGroupRequest,
  AssignUserToGroupResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse,
  DeleteGroupRequest,
  DeleteGroupResponse,
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse,
  DeleteSubjectPermissionsRequest,
  DeleteSubjectPermissionsResponse,
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectResponse,
  GetIdentityPermissionsByUserRequest,
  GetIdentityPermissionsByUserResponse,
  GetUserGroupsRequest,
  GetUserGroupsResponse,
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse
} from './dynamicPermissionsPluginInputs';

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
   * Get all {@link IdentityPermission}s associated to the user
   * @param getIdentityPermissionsByUserRequest - {@link GetIdentityPermissionsByUserRequest}
   *
   * @returns - {@link GetIdentityPermissionsByUserResponse}
   */
  getIdentityPermissionsByUser(
    getIdentityPermissionsByUserRequest: GetIdentityPermissionsByUserRequest
  ): Promise<GetIdentityPermissionsByUserResponse>;
}
