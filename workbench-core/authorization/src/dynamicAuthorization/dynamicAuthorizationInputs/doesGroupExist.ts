import { AuthenticatedUser } from '../../authenticatedUser';

/**
 * Request object for DoesGroupExist
 */
export interface DoesGroupExistRequest {
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUser;

  /**
   * Group id to be checked
   */
  groupId: string;
}

/**
 * Response object for DoesGroupExist
 */
export interface DoesGroupExistResponse {
  /**
   * Describes if group exist
   */
  exist: boolean;
}
