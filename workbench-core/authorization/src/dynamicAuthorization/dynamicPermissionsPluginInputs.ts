import Permission from '../permission';

/**
 * Request values for DynamicPermissionsPlugin's createGroup
 */
export interface CreateGroupRequest {
  /**
   * GroupID being created
   * GroupID must be unique
   */
  groupId: string;
  /**
   * Description of group
   */
  description?: string;
}
/**
 * Response object for DynamicPermissionsPlugin's createGroup
 */
export interface CreateGroupResponse {
  /**
   * States whether the group was successfully created
   */
  created: boolean;
}

/**
 * Request object for DynamicPermissionsPlugin's deleteGroup
 */
export interface DeleteGroupRequest {
  /**
   * Group id being deleted
   */
  groupId: string;
}

/**
 * Response object for DynamicPermissionsPlugin's deleteGroup
 */
export interface DeleteGroupResponse {
  /**
   * States whether the group was successfully deleted
   */
  deleted: boolean;
}
/**
 * The type of identity requesting access
 */
export type IdentityType = 'GROUP' | 'USER';

/**
 * Request object for DynamicPermissionsPlugin's getUserGroups
 */
export interface GetUserGroupsRequest {
  /**
   * User id required for retrieval of groups
   */
  userId: string;
}
/**
 * Response object for DynamicPermissionsPlugin's getUserGroups
 */
export interface GetUserGroupsResponse {
  /**
   * A list of group ids associated to the user
   */
  groupIds: string[];
}

export interface IdentityPermission {
  /**
   * {@link Identity}
   */
  identityType: IdentityType;
  /**
   * IdentityID associated to the permission
   */
  identityId: string;
  /**
   * The {@link Permission} being created
   */
  permission: Permission;
  /**
   * The id associated to the subject
   */
  subjectId: string;
}
/**
 * Request object for DynamicPermissionsPlugin's createIdentityPermissions
 */
export interface CreateIdentityPermissionsRequest {
  identityPermissions: IdentityPermission[];
}

/**
 * Response object for DynamicPermissionsPlugin's createIdentityPermissions
 */
export interface CreateIdentityPermissionsResponse {
  created: boolean;
}
/**
 * Request object for DynamicPermissionsPlugin's deleteIdentityPermissions
 */
export interface DeleteIdentityPermissionsRequest {
  identityPermissions: IdentityPermission[];
}

/**
 * Response object for DynamicPermissionsPlugin's deleteIdentityPermissions
 */
export interface DeleteIdentityPermissionsResponse {
  created: boolean;
}

export interface DeleteSubjectPermissionsRequest {}

export interface DeleteSubjectPermissionsResponse {}

export interface AssignUserToGroupRequest {}

export interface AssignUserToGroupResponse {}
export interface RemoveUserFromGroupRequest {}

export interface RemoveUserFromGroupResponse {}

export interface IsAuthorizedOnSubjectRequest {}

export interface IsAuthorizedOnSubjectResponse {}

export interface UpdateIdentityPermissionRequest {}

export interface UpdateIdentityPermissionResponse {}

export interface GetIdentityPermissionsForSubjectRequest {}

export interface GetIdentityPermissionsForSubjectResponse {}
