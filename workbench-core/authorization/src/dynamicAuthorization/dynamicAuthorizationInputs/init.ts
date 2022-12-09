import { IdentityPermission } from './identityPermission';

/**
 * Request object for Init
 */
export interface InitRequest {
  /**
   * Optional groups to create at initialization
   */
  groupsToBeCreated?: { groupIds: string[] };
  /**
   * Optional {@link IdentityPermission}s to be created
   */
  identityPermissionsToBeCreated?: IdentityPermission[];
}
/**
 * Response object for Init
 */
export interface InitResponse {
  /**
   * Determines if initialization was successful
   */
  success: boolean;
}
