/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUserParser } from '@aws/workbench-core-authorization';
import { QueryStringParamFilterParser } from '@aws/workbench-core-base';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ListProjectsRequestParser = z
  .object({
    user: AuthenticatedUserParser,
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
            message: 'Must be 0 or larger'
          });

          return z.NEVER;
        }

        return parseInt(pageSizeString);
      })
      .optional(),
    paginationToken: z.string().optional(),
    filter: z
      .object({
        createdAt: QueryStringParamFilterParser.optional(),
        dependency: QueryStringParamFilterParser.optional(),
        name: QueryStringParamFilterParser.optional(),
        status: QueryStringParamFilterParser.optional()
      })
      .strict()
      .optional(),
    sort: z
      .object({
        createdAt: z.enum(['asc', 'desc']).optional(),
        dependency: z.enum(['asc', 'desc']).optional(),
        name: z.enum(['asc', 'desc']).optional(),
        status: z.enum(['asc', 'desc']).optional()
      })
      .strict()
      .optional()
  })
  .strict();

export type ListProjectsRequest = z.infer<typeof ListProjectsRequestParser>;

export const listProjectGSINames: string[] = [
  'getResourceByCreatedAt',
  'getResourceByDependency',
  'getResourceByName',
  'getResourceByStatus'
];
