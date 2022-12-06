/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const EnvironmentItemParser = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: z.string()
});

export type EnvironmentItem = z.infer<typeof EnvironmentItemParser>;
