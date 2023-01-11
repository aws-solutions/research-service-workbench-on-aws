/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Action } from '../action';
import { Effect } from '../effect';

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
   * Used to restrict a {@link User}'s action on the subject
   * to a specific field/child subject.
   *
   * @example
   * Allows GROUP CREATE access to a child subject.
   * Allows a group associated with groupId CREATE access to a subject
   * Article associated to articleId for child subject Comment
   * ```
   *
   * const identityPermission: IdentityPermission = {
   *  identityType: 'GROUP',
   *  identityId: 'groupId',
   *  effect: 'ALLOW',
   *  action: Action.CREATE,
   *  subject: 'Article',
   *  subjectId: 'articleId',
   *  fields: ['Comment']
   * };
   * ```
   */
  fields?: string[];
  /**
   * Used to conditionally restrict a {@link User}'s action
   */
  conditions?: { [key: string]: unknown };

  /**
   * Reason for why this is forbidden.
   */
  reason?: string;
}

export interface Identity {
  identityType: IdentityType;
  identityId: string;
}
