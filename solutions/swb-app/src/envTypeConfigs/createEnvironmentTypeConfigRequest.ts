/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateEnvironmentTypeConfigRequestParser = z
  .object({
    envTypeId: z.string().etId().required(),
    type: z.string().required(),
    description: z.string().swbDescription().required(),
    name: z.string().swbName().required(),
    estimatedCost: z.optional(z.string()),
    params: z.array(
      z
        .object({
          key: z.string(),
          value: z.string()
        })
        .required()
    )
  })
  .strict();

export type CreateEnvironmentTypeConfigRequest = z.infer<typeof CreateEnvironmentTypeConfigRequestParser>;
