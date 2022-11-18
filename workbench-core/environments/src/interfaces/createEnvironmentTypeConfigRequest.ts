/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateEnvironmentTypeConfigRequestParser = z.object({
  envTypeId: z.string(),
  params: z.object({
    type: z.string(),
    description: z.string(),
    name: z.string(),
    estimatedCost: z.optional(z.string()),
    projectIds: z.array(z.string()).optional(),
    params: z.array(
      z.object({
        key: z.string(),
        value: z.string()
      })
    )
  })
});

export type CreateEnvironmentTypeConfigRequest = z.infer<typeof CreateEnvironmentTypeConfigRequestParser>;
