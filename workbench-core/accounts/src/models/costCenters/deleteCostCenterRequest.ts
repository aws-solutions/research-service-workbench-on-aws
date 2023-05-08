/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const DeleteCostCenterRequestParser = z
  .object({
    id: z.string().costCenterId().required()
  })
  .strict();

export type DeleteCostCenterRequest = z.infer<typeof DeleteCostCenterRequestParser>;
