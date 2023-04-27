/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { getPaginationParser, QueryStringParamFilterParser, z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const ListEnvironmentTypesRequestParser = z
  .object({
    ...getPaginationParser(),
    filter: z
      .object({
        name: QueryStringParamFilterParser.optional(),
        status: QueryStringParamFilterParser.optional()
      })
      .strict()
      .optional(),
    sort: z
      .object({
        name: z.enum(['asc', 'desc']).optional(),
        status: z.enum(['asc', 'desc']).optional()
      })
      .strict()
      .optional()
  })
  .strict();

export type ListEnvironmentTypesRequest = z.infer<typeof ListEnvironmentTypesRequestParser>;
