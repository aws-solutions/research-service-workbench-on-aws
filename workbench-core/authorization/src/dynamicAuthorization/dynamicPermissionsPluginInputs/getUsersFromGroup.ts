/**
 * Request object for DynamicPermissionsPlugin's getUsersFromGroup
 */
export interface GetUsersFromGroupRequest {
  /**
   * Group id required for retrieval of users
   */
  groupId: string;
}
/**
 * Response object for DynamicPermissionsPlugin's getUsersFromGroup
 */
export interface GetUsersFromGroupResponse {
  /**
   * A list of user ids associated to the group
   */
  userIds: string[];
}
