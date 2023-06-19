/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateEnvironmentTypeRequestParser = z
  .object({
    envTypeId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['APPROVED', 'NOT_APPROVED']).optional()
  })
  .strict();

export type UpdateEnvironmentTypeRequest = z.infer<typeof UpdateEnvironmentTypeRequestParser>;
