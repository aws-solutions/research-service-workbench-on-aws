import { AuthenticatedUser } from '../../authenticatedUser';

/**
 * Request object for DeleteGroup
 */
export interface DeleteGroupRequest {
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUser;
  /**
   * Group id being deleted
   */
  groupId: string;
}

/**
 * Response object for DeleteGroup
 */
export interface DeleteGroupResponse {
  /**
   * States whether the group was successfully deleted
   */
  deleted: boolean;
}
