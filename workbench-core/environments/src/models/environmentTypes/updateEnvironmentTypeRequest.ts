/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateEnvironmentTypeRequestParser = z
  .object({
    envTypeId: z.string().etId().required(),
    name: z.string().rswName().optionalNonEmpty(),
    description: z.string().rswDescription().optional(),
    status: z.enum(['APPROVED', 'NOT_APPROVED']).optional()
  })
  .strict();

export type UpdateEnvironmentTypeRequest = z.infer<typeof UpdateEnvironmentTypeRequestParser>;
