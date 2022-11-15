/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

/************
 *
 * Only one operator can be defined by property, if multiple operators are defined, dynamo service will throw an exception.
 *
 ************/
// export interface QueryParameterFilter<T> {
//   eq?: T;
//   lt?: T;
//   lte?: T;
//   gt?: T;
//   gte?: T;
//   between?: { value1: T; value2: T };
//   begins?: T;
// }

// eslint-disable-next-line @rushstack/typedef-var
export const QueryParamFilterParser = z.object({
  eq: z.string().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  between: z
    .object({
      value1: z.string(),
      value2: z.string()
    })
    .optional(),
  begins: z.string().optional()
});

export type QueryParamFilter = z.infer<typeof QueryParamFilterParser>;
