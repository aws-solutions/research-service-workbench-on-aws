import { Action } from '../action';
import { Effect } from '../permission';

/**
 * Request object for DynamicPermissionsPlugin's createGroup
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

export interface GetUsersFromGroupRequest {
  /**
   * Group id required for retrieval of users
   */
  groupId: string;
}

export interface GetUsersFromGroupResponse {
  /**
   * A list of user ids associated to the group
   */
  userIds: string[];
}

/**
 * Represents an Identity Permission
 */
export interface IdentityPermission {
  /**
   * {@link IdentityType}
   */
  identityType: IdentityType;
  /**
   * IdentityID associated to the permission
   */
  identityId: string;
  /**
   * The {@link Effect} of a Permission.
   */
  effect: Effect;
  /**
   * {@link Action}.
   */
  action: Action;
  /**
   * The subject that the {@link Action} acts on.
   */
  subjectType: string;
  /**
   * The id associated to the subject
   * Capable of using a wildcard '*' to represent all ids
   */
  subjectId: string;
  /**
   * Used to restrict a {@link User}'s action on the subject
   * to a specific field/child subject.
   *
   * @example
   * Allows GROUP CREATE access to a child subject.
   * Allows a group associated with groupId CREATE access to a subject
   * Article associated to articleId for child subject Comment
   * ```
   *
   * const identityPermission: IdentityPermission = {
   *  identityType: 'GROUP',
   *  identityId: 'groupId',
   *  effect: 'ALLOW',
   *  action: Action.CREATE,
   *  subject: 'Article',
   *  subjectId: 'articleId',
   *  fields: ['Comment']
   * };
   * ```
   */
  fields?: string[];
  /**
   * Used to conditionally restrict a {@link User}'s action
   */
  conditions?: { [key: string]: unknown };

  /**
   * Reason for why this is forbidden.
   */
  reason?: string;
}

export interface Identity {
  identityType: IdentityType;
  identityId: string;
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
  /**
   * Unprocessed {@link IdentityPermission}s
   */
  unprocessedIdentityPermissions?: IdentityPermission[];
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
   * The subject type to be deleted
   */
  subjectType: string;

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
 * Request object for DynamicPermissionsPlugin's getIdentityPermissionsBySubject
 */
export interface GetIdentityPermissionsBySubjectRequest {
  /**
   * SubjectType associated to the {@link IdentityPermission}s
   */
  subjectType: string;
  /**
   * Subject id associated to the subject
   */
  subjectId: string;
  /**
   * Filter by {@link Action}
   */
  action?: Action;
  /**
   * Filter by identities
   */
  identities?: Identity[];
}

/**
 * Response object for DynamicPermissionsPlugin's getIdentityPermissionsBySubject
 */
export interface GetIdentityPermissionsBySubjectResponse {
  /**
   * An array of {@link IdentityPermission} associated to the subject
   */
  identityPermissions: IdentityPermission[];
}

export interface GetIdentityPermissionsByIdentityRequest {
  /**
   * {@link IdentityType}
   */
  identityType: IdentityType;
  /**
   * Identity id associated to the {@link IdentityPermission}s
   */
  identityId: string;
}

export interface GetIdentityPermissionsByIdentityResponse {
  /**
   * An array of {@link IdentityPermission} associated to the identity
   */
  identityPermissions: IdentityPermission[];
}
