import { AuthenticatedUser } from '@amzn/workbench-core-authentication';
import Operation from './operation';
import Permission from './permission';
import { HTTPMethod } from './routesMap';

/**
 * Represents the PermissionsPlugin.
 */
export default interface PermissionsPlugin {
  /**
   * Returns a set of {@link Permission} given a {@link AuthenticatedUser}.
   * @param user - {@link AuthenticatedUser}
   *
   * @returns A Promise for a set of the {@link AuthenticatedUser}'s {@link Permission}.
   */
  getPermissionsByUser(user: AuthenticatedUser): Promise<Permission[]>;

  /**
   * Returns a set of {@link Operation} given a Route and {@link HTTPMethod}.
   * @param route - The path the user is requesting access to.
   * @param method - {@link HTTPMethod}.
   */
  getOperationsByRoute(route: string, method: HTTPMethod): Promise<Operation[]>;
}
