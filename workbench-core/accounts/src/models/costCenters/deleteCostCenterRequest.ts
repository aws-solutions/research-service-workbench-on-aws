/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const DeleteCostCenterRequestParser = z
  .object({
    id: z.string()
  })
  .strict();

export type DeleteCostCenterRequest = z.infer<typeof DeleteCostCenterRequestParser>;
