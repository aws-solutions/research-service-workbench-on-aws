import { AuthenticatedUser } from '../../authenticatedUser';

/**
 * Request object for AddUserToGroup
 */
export interface AddUserToGroupRequest {
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUser;
  /**
   * User id associated to user to be added to group
   */
  userId: string;
  /**
   * Group id associated to the group the user is being added to
   */
  groupId: string;
}

/**
 * Response object for AddUserToGroup
 */
export interface AddUserToGroupResponse {
  /**
   * States whether the user was successfully added to the group
   */
  added: boolean;
}
