import { IdentityPermission } from './identityPermission';

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
