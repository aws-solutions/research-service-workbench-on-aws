/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Action } from '../../action';
import { Effect } from '../../permission';

/**
 * The type of identity requesting access
 */
export type IdentityType = 'GROUP' | 'USER';

/**
 * Represents an Identity Permission
 */
export interface IdentityPermission {
  /**
   * {@link IdentityType}
   */
  identityType: IdentityType;
  /**
   * IdentityID associated to the permission
   */
  identityId: string;
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
  subjectType: string;
  /**
   * The id associated to the subject
   * Capable of using a wildcard '*' to represent all ids
   */
  subjectId: string;
  /**
   * Used to restrict a {@link User}'s action to a subject's field.
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
   * Used to conditionally restrict a {@link User}'s action
   */
  conditions?: Record<string, unknown>;

  /**
   * Description of permission
   */
  description?: string;
}

export interface Identity {
  identityType: IdentityType;
  identityId: string;
}
