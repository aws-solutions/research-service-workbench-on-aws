/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateEnvironmentRequestParser = z
  .object({
    projectId: z.string().min(1).required(),
    name: z.string().swbName().min(1).required(),
    description: z.string().min(1).swbDescription().required(),
    envTypeId: z.string().min(1).required(),
    envTypeConfigId: z.string().min(1).required(),
    envType: z.string().min(1).required(),
    datasetIds: z.array(z.string()).default([])
  })
  .strict();

export type CreateEnvironmentRequest = z.infer<typeof CreateEnvironmentRequestParser>;
