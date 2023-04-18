/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUserParser } from '@aws/workbench-core-authorization';
import { MAX_API_PAGE_SIZE, resourceTypeToKey, z } from '@aws/workbench-core-base';
import { getPaginationParser } from '../validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const ListDataSetRequestParser = z
  .object({
    projectId: z.string().swbId(resourceTypeToKey.project).required(),
    user: AuthenticatedUserParser,
    ...getPaginationParser(1, MAX_API_PAGE_SIZE)
  })
  .strict();

export type ListDataSetRequest = z.infer<typeof ListDataSetRequestParser>;
