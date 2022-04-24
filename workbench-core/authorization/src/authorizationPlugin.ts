import { User } from '@amzn/workbench-core-authentication';
import { Permission } from './permissionsPlugin';

/**
 * Represents an AuthorizationPlugin.
 */
export default interface AuthorizationPlugin {
  /**
   * Checks whether a {@link User} is authorized given a set of {@link Permission}.
   * @param user - {@link User}.
   * @param permissionsRequired - An array of {@link Permission}.
   *
   * @returns A promise for a boolean stating whether or not they are authorized.
   */
  isAuthorized(user: User, permissionsRequired: Permission[]): Promise<boolean>;
}
