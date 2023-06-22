/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryStringParamFilterParser, getPaginationParser, z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const ListCostCentersRequestParser = z.object({
  ...getPaginationParser(),
  filter: z
    .object({
      name: QueryStringParamFilterParser
    })
    .optional(),
  sort: z
    .object({
      name: z.enum(['asc', 'desc'])
    })
    .optional()
});

export type ListCostCentersRequest = z.infer<typeof ListCostCentersRequestParser>;
