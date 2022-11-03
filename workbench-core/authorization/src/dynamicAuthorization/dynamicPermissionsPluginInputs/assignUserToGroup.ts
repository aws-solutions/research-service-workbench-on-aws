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
