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
