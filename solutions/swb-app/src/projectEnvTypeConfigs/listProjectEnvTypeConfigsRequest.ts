/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { getPaginationParser } from '../validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const ListProjectEnvTypeConfigsRequestParser = z
  .object({
    projectId: z.string(),
    envTypeId: z.string(),
    ...getPaginationParser()
  })
  .strict();

export type ListProjectEnvTypeConfigsRequest = z.infer<typeof ListProjectEnvTypeConfigsRequestParser>;
