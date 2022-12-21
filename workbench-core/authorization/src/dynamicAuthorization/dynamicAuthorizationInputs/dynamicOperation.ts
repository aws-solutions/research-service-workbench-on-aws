/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Action } from '../../action';

/**
 * The dynamic operation a {@link User} wants to perform
 */
export interface DynamicOperation {
  /**
   * The {@link Action} a {@link User} wants to perform.
   */
  action: Action;
  /**
   * The subject type that the {@link Action} acts on.
   */
  subjectType: string;
  /**
   * subject id associated to the subject being operated on
   */
  subjectId: string;
  /**
   * The field a {@link User} wants access to.
   */
  field?: string;
  /**
   * Attributes associated to the subject
   */
  subjectAttributes?: Record<string, unknown>;
}
