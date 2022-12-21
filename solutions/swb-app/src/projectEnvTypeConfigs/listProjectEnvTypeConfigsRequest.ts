/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ListProjectEnvTypeConfigsRequestParser = z
  .object({
    projectId: z.string(),
    envTypeId: z.string(),
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
    paginationToken: z.string().optional()
  })
  .strict();

export type ListProjectEnvTypeConfigsRequest = z.infer<typeof ListProjectEnvTypeConfigsRequestParser>;
