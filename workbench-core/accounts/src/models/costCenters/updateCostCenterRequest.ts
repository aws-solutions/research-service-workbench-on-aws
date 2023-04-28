/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { resourceTypeToKey, z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateCostCenterRequestParser = z
  .object({
    id: z.string().swbId(resourceTypeToKey.costCenter.toLowerCase()).required(),
    name: z.string().nonEmpty().optional(),
    description: z.string().swbDescription().nonEmpty().optional()
  })
  .strict();

export type UpdateCostCenterRequest = z.infer<typeof UpdateCostCenterRequestParser>;
