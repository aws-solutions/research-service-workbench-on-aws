/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ListAccountsRequestParser = z.object({
  pageSize: z.string().transform((pageSizeString, ctx) => {
    const pageSize = parseInt(pageSizeString);
    if (isNaN(pageSize)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be a number'
      });

      return z.NEVER;
    }

    if (pageSize > 100 || pageSize < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be between 1 and 100'
      });

      return z.NEVER;
    }

    return pageSize;
  }),
  paginationToken: z.string().optional()
});

export type ListAccountRequest = z.infer<typeof ListAccountsRequestParser>;
