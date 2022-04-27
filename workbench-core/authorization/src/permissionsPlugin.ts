import { User } from '@amzn/workbench-core-authentication';
import { Action } from './action';

/**
 * States whether a {@link Permission} should be ALLOW or DENY.
 */
type Effect = 'ALLOW' | 'DENY';

/**
 * Represents what a Permission contains.
 */
export interface Permission {
  /**
   * The {@link Effect} of a Permission.
   */
  effect: Effect;
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
   *
   * @example
   * Allows User update access to only 'method';
   * ```
   *  class Article {
   *    method() {
   *    }
   *    methodTwo() {
   *    }
   *  }
   *
   * const permission:Permission = {
   *  action: Action.UPDATE,
   *  subject: 'Article',
   *  fields: ['method']
   * };
   * ```
   */
  fields?: string[];
  /**
   * An object used to restrict a {@link User}'s {@link Action} only to matched subjects.
   *
   * @example
   * Allows User read access to only an article with the name 'Article Title'.
   * ```
   * class Article {
   *    name: string;
   *    method() {
   *    }
   *    methodTwo() {
   *    }
   *  }
   *
   * const permission: Permission = {
   *  action: Action.READ,
   *  subject: 'Article',
   *  condition: {name: 'Article Title'}
   * }
   *
   * ```
   */
  conditions?: object;

  /**
   * Reason for why this is forbidden.
   */
  reason?: string;
}

/**
 * The operation a {@link User} wants to perform.
 */
export interface Operation {
  /**
   * The {@link Action} a {@link User} wants to perform.
   */
  action: Action;

  /**
   * The subject that the {@link Action} acts on.
   */
  subject: string;

  /**
   * The field a {@link User} wants access to.
   */
  field?: string;
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
