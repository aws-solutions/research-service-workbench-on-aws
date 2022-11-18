/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const EnvironmentTypeConfigParser = z.object({
  id: z.string(),
  productId: z.string(),
  provisioningArtifactId: z.string(),
  type: z.string(),
  description: z.string(),
  name: z.string(),
  resourceType: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  estimatedCost: z.string().optional(),
  params: z.array(
    z.object({
      key: z.string(),
      value: z.string()
    })
  )
});

export type EnvironmentTypeConfig = z.infer<typeof EnvironmentTypeConfigParser>;
