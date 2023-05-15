/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { lengthValidationMessage, urlFilterMaxLength, betweenFilterMessage } from '../utilities/textUtil';
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
    eq: parameterFilterParser.optionalNonEmpty(),
    lt: parameterFilterParser.optionalNonEmpty(),
    lte: parameterFilterParser.optionalNonEmpty(),
    gt: parameterFilterParser.optionalNonEmpty(),
    gte: parameterFilterParser.optionalNonEmpty(),
    between: z
      .object({
        value1: parameterFilterParser.required(),
        value2: parameterFilterParser.required()
      })
      .refine((data) => data.value1 <= data.value2, {
        message: betweenFilterMessage
      })
      .optional(),
    begins: parameterFilterParser.optionalNonEmpty()
  })
  .strict();

export type QueryStringParamFilter = z.infer<typeof QueryStringParamFilterParser>;
