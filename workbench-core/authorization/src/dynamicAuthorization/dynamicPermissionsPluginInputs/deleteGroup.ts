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
