/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { CFNTemplateParametersParser } from '@aws/workbench-core-base';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const EnvironmentTypeParser = z.object({
  id: z.string(),
  productId: z.string(),
  provisioningArtifactId: z.string(),
  description: z.string(),
  name: z.string(),
  type: z.string(),
  params: CFNTemplateParametersParser,
  status: z.enum(['APPROVED', 'NOT_APPROVED']),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type EnvironmentType = z.infer<typeof EnvironmentTypeParser>;
