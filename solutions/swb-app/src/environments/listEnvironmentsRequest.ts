/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryStringParamFilterParser, z } from '@aws/workbench-core-base';
import { getPaginationParser } from '../validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const ListEnvironmentsRequestParser = z
  .object({
    ...getPaginationParser(),
    filter: z
      .object({
        name: QueryStringParamFilterParser.optional(),
        status: QueryStringParamFilterParser.optional(),
        createdAt: QueryStringParamFilterParser.optional(),
        owner: QueryStringParamFilterParser.optional(),
        projectId: QueryStringParamFilterParser.optional()
      })
      .strict()
      .optional(),
    sort: z
      .object({
        name: z.enum(['asc', 'desc']).optional(),
        status: z.enum(['asc', 'desc']).optional(),
        createdAt: z.enum(['asc', 'desc']).optional(),
        owner: z.enum(['asc', 'desc']).optional(),
        projectId: z.enum(['asc', 'desc']).optional()
      })
      .strict()
      .optional()
  })
  .strict();

export type ListEnvironmentsRequest = z.infer<typeof ListEnvironmentsRequestParser>;
