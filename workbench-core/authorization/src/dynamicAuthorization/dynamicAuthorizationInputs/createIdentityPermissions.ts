import { AuthenticatedUser } from '../../authenticatedUser';
import { IdentityPermission } from './identityPermission';

/**
 * Request object for CreateIdentityPermissions
 */
export interface CreateIdentityPermissionsRequest {
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUser;
  /**
   * An array of {@link IdentityPermission} to be created
   */
  identityPermissions: IdentityPermission[];
}

/**
 * Response object for CreateIdentityPermissions
 */
export interface CreateIdentityPermissionsResponse {
  /**
   * An array of {@link IdentityPermission}s created
   */
  identityPermissions: IdentityPermission[];
}
