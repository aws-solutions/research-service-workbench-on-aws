import { User } from '@amzn/workbench-core-authentication';
import { Action } from './action';
/**
 * Represents what a Permission contains.
 */
export interface Permission {
  /**
   * {@link Action}.
   */
  action: Action;
  /**
   * The subject that the {@link Action} acts on.
   */
  subject: string;
  /**
   * Used to restrict a {@link User}'s action to a specific field.
   */
  field?: string[];
  /**
   * An object used to restrict a {@link User}'s {@link Action} only to matched subjects.
   */
  condition?: object;
}
/**
 * A map that represents the mapping of a role to a set of {@link Permission}.
 */
export interface PermissionsMap {
  [role: string]: Permission[];
}

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
}
