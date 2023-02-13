/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateEnvironmentTypeConfigRequestParser = z
  .object({
    envTypeId: z.string(),
    type: z.string(),
    description: z.string(),
    name: z.string(),
    estimatedCost: z.optional(z.string()),
    params: z.array(
      z.object({
        key: z.string(),
        value: z.string()
      })
    )
  })
  .strict();

export type CreateEnvironmentTypeConfigRequest = z.infer<typeof CreateEnvironmentTypeConfigRequestParser>;
