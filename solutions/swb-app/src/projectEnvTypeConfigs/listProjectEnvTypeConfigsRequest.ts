/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { resourceTypeToKey, z } from '@aws/workbench-core-base';
import { getPaginationParser } from '../validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const ListProjectEnvTypeConfigsRequestParser = z
  .object({
    envTypeId: z.string().etId().required(),
    projectId: z.string().swbId(resourceTypeToKey.project).required(),
    ...getPaginationParser()
  })
  .strict();

export type ListProjectEnvTypeConfigsRequest = z.infer<typeof ListProjectEnvTypeConfigsRequestParser>;
