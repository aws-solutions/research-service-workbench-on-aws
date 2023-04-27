/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { lengthValidationMessage, urlFilterMaxLength } from '../utilities/textUtil';
import { z } from '../utilities/validatorHelper';

/************
 *
 * Only one operator can be defined by property, if multiple operators are defined, dynamo service will throw an exception.
 *
 ************/
const parameterFilterParser: z.ZodString = z
  .string()
  .max(urlFilterMaxLength, { message: lengthValidationMessage(urlFilterMaxLength) });
// eslint-disable-next-line @rushstack/typedef-var
export const QueryStringParamFilterParser = z
  .object({
    eq: parameterFilterParser.optional(),
    lt: parameterFilterParser.optional(),
    lte: parameterFilterParser.optional(),
    gt: parameterFilterParser.optional(),
    gte: parameterFilterParser.optional(),
    between: z
      .object({
        value1: parameterFilterParser,
        value2: parameterFilterParser
      })
      .optional(),
    begins: parameterFilterParser.optional()
  })
  .strict();

export type QueryStringParamFilter = z.infer<typeof QueryStringParamFilterParser>;
