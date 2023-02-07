/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { ActionParser } from '../../models/action';

// eslint-disable-next-line @rushstack/typedef-var
export const DynamicOperationParser = z.object({
  /**
   * The {@link Action} a {@link User} wants to perform.
   */
  action: ActionParser,
  /**
   * The subject that the {@link Action} acts on.
   */
  subject: z.record(z.string()).and(
    z.object({
      subjectType: z.string(),
      subjectId: z.string()
    })
  ),
  /**
   * The field a {@link User} wants access to.
   */
  field: z.string().optional()
});

/**
 * The dynamic operation a {@link User} wants to perform
 */
export type DynamicOperation = z.infer<typeof DynamicOperationParser>;
