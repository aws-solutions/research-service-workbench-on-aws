/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const EnvironmentParser = z.object({
  id: z.string(),
  instanceId: z.string().optional(),
  cidr: z.string(),
  description: z.string(),
  error: z
    .object({
      type: z.string(),
      value: z.string()
    })
    .optional(),
  name: z.string(),
  outputs: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
        description: z.string()
      })
    )
    .default([]),
  projectId: z.string(),
  status: z.string(),
  provisionedProductId: z.string(),
  envTypeConfigId: z.string(),
  updatedAt: z.string(),
  updatedBy: z.string(),
  createdAt: z.string(),
  createdBy: z.string(),
  owner: z.string(),
  type: z.string(),
  dependency: z.string(),
  ETC: z.any().optional(),
  PROJ: z.any().optional(),
  DATASETS: z.array(z.any()).optional(),
  ENDPOINTS: z.array(z.any()).optional(),
  INID: z.any().optional()
});

export type Environment = z.infer<typeof EnvironmentParser>;
