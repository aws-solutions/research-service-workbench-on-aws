/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const GetProjectEnvTypeConfigRequestParser = z
  .object({
    envTypeId: z.string(),
    envTypeConfigId: z.string(),
    projectId: z.string()
  })
  .strict();

export type GetProjectEnvTypeConfigRequest = z.infer<typeof GetProjectEnvTypeConfigRequestParser>;
