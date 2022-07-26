/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Action } from './action';
/**
 * States whether a {@link Permission} should be ALLOW or DENY.
 */
export type Effect = 'ALLOW' | 'DENY';

/**
 * Represents what a Permission contains.
 */
export default interface Permission {
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
   * Reason for why this is forbidden.
   */
  reason?: string;
}

/**
 * A map that represents the mapping of a role to a set of {@link Permission}.
 */
export interface PermissionsMap {
  [role: string]: Permission[];
}
