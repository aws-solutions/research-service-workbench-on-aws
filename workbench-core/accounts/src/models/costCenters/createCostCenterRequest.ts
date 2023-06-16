/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateCostCenterRequestParser = z.object({
  name: z.string(),
  accountId: z.string(),
  description: z.string()
});

export type CreateCostCenterRequest = z.infer<typeof CreateCostCenterRequestParser>;
