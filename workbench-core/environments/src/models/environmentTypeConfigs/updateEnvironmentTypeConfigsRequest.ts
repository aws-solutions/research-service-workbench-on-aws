/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateEnvironmentTypeConfigRequestParser = z
  .object({
    envTypeId: z.string().etId().required(),
    envTypeConfigId: z.string().etcId().required(),
    description: z.string().swbDescription().optional(),
    estimatedCost: z.string().optional()
  })
  .strict();

export type UpdateEnvironmentTypeConfigRequest = z.infer<typeof UpdateEnvironmentTypeConfigRequestParser>;
