import { User } from '@amzn/workbench-core-authentication';
import { Operation } from './permissionsPlugin';

/**
 * Represents an AuthorizationPlugin.
 */
export default interface AuthorizationPlugin {
  /**
   * Checks whether a {@link User} is authorized to perform a set of {@link Operation}s.
   * @param user - {@link User}.
   * @param operations - An array of {@link Operation}s that the user wants to perform.
   *
   * @returns A promise for a boolean stating whether or not they are authorized.
   */
  isAuthorized(user: User, operations: Operation[]): Promise<boolean>;
}
