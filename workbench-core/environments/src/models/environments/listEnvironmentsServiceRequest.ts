/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryStringParamFilterParser } from '@aws/workbench-core-base';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ListEnvironmentsServiceRequestParser = z.object({
  pageSize: z.number().optional(),
  paginationToken: z.string().optional(),
  filter: z
    .object({
      name: QueryStringParamFilterParser.optional(),
      status: QueryStringParamFilterParser.optional(),
      createdAt: QueryStringParamFilterParser.optional(),
      owner: QueryStringParamFilterParser.optional(),
      type: QueryStringParamFilterParser.optional(),
      dependency: QueryStringParamFilterParser.optional()
    })
    .optional(),
  sort: z
    .object({
      name: z.enum(['asc', 'desc']).optional(),
      status: z.enum(['asc', 'desc']).optional(),
      createdAt: z.enum(['asc', 'desc']).optional(),
      owner: z.enum(['asc', 'desc']).optional(),
      type: z.enum(['asc', 'desc']).optional(),
      dependency: z.enum(['asc', 'desc']).optional()
    })
    .optional()
});

export type ListEnvironmentsServiceRequest = z.infer<typeof ListEnvironmentsServiceRequestParser>;
