import { AuthenticatedUser } from '../../authenticatedUser';

/**
 * Request object for RemoveUserFromGroup
 */
export interface RemoveUserFromGroupRequest {
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUser;
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
 * Response object for RemoveUserFromGroup
 */
export interface RemoveUserFromGroupResponse {
  /**
   * States whether the user was successfully removed from group
   */
  removed: boolean;
}