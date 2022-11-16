/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryStringParamFilterParser } from '@aws/workbench-core-base';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ListCostCentersRequestParser = z.object({
  pageSize: z
    .string()
    .transform((pageSizeString, ctx) => {
      const pageSize = parseInt(pageSizeString);
      if (isNaN(pageSize)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Must be a number'
        });

        return z.NEVER;
      }
      if (pageSize < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Page size must be 0 or larger'
        });

        return z.NEVER;
      }

      return parseInt(pageSizeString);
    })
    .optional(),
  paginationToken: z.string().optional(),
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
