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

/**
 * Represents an Identity Permission
 */
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
  /**
   * An array of {@link IdentityPermission} to be created
   */
  identityPermissions: IdentityPermission[];
}

/**
 * Response object for DynamicPermissionsPlugin's createIdentityPermissions
 */
export interface CreateIdentityPermissionsResponse {
  /**
   * States whether the {@link IdentityPermission}s were successfully created
   */
  created: boolean;
}
/**
 * Request object for DynamicPermissionsPlugin's deleteIdentityPermissions
 */
export interface DeleteIdentityPermissionsRequest {
  /**
   * An array of {@link IdentityPermission} to be deleted
   */
  identityPermissions: IdentityPermission[];
}

/**
 * Response object for DynamicPermissionsPlugin's deleteIdentityPermissions
 */
export interface DeleteIdentityPermissionsResponse {
  /**
   * States whether the {@link IdentityPermission}s were successfully deleted
   */
  deleted: boolean;
}

/**
 * Request object for DynamicPermissionsPlugin's deleteSubjectPermissions
 */
export interface DeleteSubjectPermissionsRequest {
  /**
   * The subject to be deleted
   */
  subject: string;

  /**
   * The subject id associated to the subject to be deleted
   */
  subjectId: string;
}
/**
 * Response object for DynamicPermissionsPlugin's deleteSubjectPermissions
 */
export interface DeleteSubjectPermissionsResponse {
  /**
   * States whether all the subject's permissions were successfully created
   */
  deleted: boolean;
}
/**
 * Request object for DynamicPermissionsPlugin's assignUserToGroup
 */
export interface AssignUserToGroupRequest {
  /**
   * User id associated to user to be assigned to group
   */
  userId: string;
  /**
   * Group id associated to the group the user is being assigned to
   */
  groupId: string;
}

/**
 * Response object for DynamicPermissionsPlugin's assignUserToGroup
 */
export interface AssignUserToGroupResponse {
  /**
   * States whether the user was successfully assigned to the group
   */
  assigned: boolean;
}
/**
 * Request object for DynamicPermissionsPlugin's removeUserFromGroup
 */
export interface RemoveUserFromGroupRequest {
  /**
   * User id associated to the user being removed from group
   */
  userId: string;
  /**
   * Group id associated to the group the user is being removed from
   */
  groupId: string;
}
/**
 * Response object for DynamicPermissionsPlugin's removeUserFromGroup
 */
export interface RemoveUserFromGroupResponse {
  /**
   * States whether the user was successfully removed from group
   */
  removed: boolean;
}
/**
 * Request object for DynamicPermissionsPlugin's getIdentityPermissionsForSubject
 */
export interface GetIdentityPermissionsForSubjectRequest {
  /**
   * Subject associated to the identity permissions
   */
  subject: string;

  /**
   * Subject id associated to the subject
   */
  subjectId: string;

  /**
   * Filter the permissions associated to the user
   */
  userId?: string;
}

/**
 * Response object for DynamicPermissionsPlugin's getIdentityPermissionsForSubject
 */
export interface GetIdentityPermissionsForSubjectResponse {
  /**
   * an array of {@link IdentityPermission} associated to the subject
   */
  identityPermissions: IdentityPermission[];
}
