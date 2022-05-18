import { User } from '@amzn/workbench-core-authentication';
import Operation from './operation';
import Permission from './permission';
import { HTTPMethod } from './routesMap';

/**
 * Represents the PermissionsPlugin.
 */
export default interface PermissionsPlugin {
  /**
   * Returns a set of {@link Permission} given a {@link User}.
   * @param user - {@link User}
   *
   * @returns A Promise for a set of the {@link User}'s {@link Permission}.
   */
  getPermissionsByUser(user: User): Promise<Permission[]>;

  /**
   * Returns a set of {@link Operation} given a Route and {@link HTTPMethod}.
   * @param route - The path the user is requesting access to.
   * @param method - {@link HTTPMethod}.
   */
  getOperationsByRoute(route: string, method: HTTPMethod): Promise<Operation[]>;
}
