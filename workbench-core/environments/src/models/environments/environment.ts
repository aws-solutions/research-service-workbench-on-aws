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
  name: z.string(),
  projectId: z.string(),
  status: z.string(),
  provisionedProductId: z.string(),
  envTypeConfigId: z.string(),
  updatedAt: z.string(),
  createdAt: z.string(),
  owner: z.string(),
  ETC: z.any().optional(),
  PROJ: z.any().optional(),
  DATASETS: z.array(z.any()).optional(),
  ENDPOINTS: z.array(z.any()).optional(),
  INID: z.any().optional()
});

export type Environment = z.infer<typeof EnvironmentParser>;
