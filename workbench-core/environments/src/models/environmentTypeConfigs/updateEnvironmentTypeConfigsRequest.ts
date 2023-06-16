/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateEnvironmentTypeConfigRequestParser = z
  .object({
    envTypeId: z.string(),
    envTypeConfigId: z.string(),
    description: z.string().optional(),
    estimatedCost: z.string().optional()
  })
  .strict();

export type UpdateEnvironmentTypeConfigRequest = z.infer<typeof UpdateEnvironmentTypeConfigRequestParser>;
