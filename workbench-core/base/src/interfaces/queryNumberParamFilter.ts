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
// export interface QueryParamFilter<T> {
//   eq?: T;
//   lt?: T;
//   lte?: T;
//   gt?: T;
//   gte?: T;
//   between?: { value1: T; value2: T };
//   begins?: T;
// }

// export function QueryParamFilterParser<T extends z.ZodTypeAny>(
//   schema: T,
//   request: unknown
// ): QueryParamFilter<T> {
//   const zodType = z.object({
//     eq: schema.optional(),
//     lt: schema.optional(),
//     lte: schema.optional(),
//     gt: schema.optional(),
//     gte: schema.optional(),
//     between: z
//       .object({
//         value1: schema,
//         value2: schema
//       })
//       .optional(),
//     begins: schema.optional()
//   });
//   return zodType.parse(request);
// }

// eslint-disable-next-line @rushstack/typedef-var
export const QueryNumberParamFilterParser = z.object({
  eq: z.number().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  between: z
    .object({
      value1: z.number(),
      value2: z.number()
    })
    .optional(),
  begins: z.number().optional()
});

export type QueryNumberParamFilter = z.infer<typeof QueryNumberParamFilterParser>;
