/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateCostCenterRequestParser = z
  .object({
    id: z.string().costCenterId().required(),
    name: z.string().swbName().optionalNonEmpty(),
    description: z.string().swbDescription().optionalNonEmpty()
  })
  .strict();

export type UpdateCostCenterRequest = z.infer<typeof UpdateCostCenterRequestParser>;
