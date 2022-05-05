import { Operation, Permission } from './permissionsPlugin';

/**
 * Represents an AuthorizationPlugin.
 */
export default interface AuthorizationPlugin {
  /**
   * Checks whether a set of a user's {@link Permission}s is authorized to perform a set of {@link Operation}s.
   * @param userPermissions - {@link Permission}.
   * @param operations - An array of {@link Operation}s that the user wants to perform.
   *
   * @returns A promise when user is authorized, otherwise throw on failure.
   */
  isAuthorized(userPermissions: Permission[], operations: Operation[]): Promise<void>;
}
