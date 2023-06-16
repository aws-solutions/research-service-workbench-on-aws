/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateEnvironmentRequestParser = z
  .object({
    projectId: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    envTypeId: z.string().min(1),
    envTypeConfigId: z.string().min(1),
    envType: z.string().min(1),
    datasetIds: z.array(z.string()).default([])
  })
  .strict();

export type CreateEnvironmentRequest = z.infer<typeof CreateEnvironmentRequestParser>;
