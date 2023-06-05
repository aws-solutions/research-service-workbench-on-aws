/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUserParser } from '../../../authorization/models/authenticatedUser';
import { QueryStringParamFilterParser } from '../../../base/interfaces/queryStringParamFilter';
import { getPaginationParser, z } from '../../../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const ListProjectsRequestParser = z
  .object({
    user: AuthenticatedUserParser,
    ...getPaginationParser(),
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
