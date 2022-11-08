/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema filter Query Params filters in API
import { Schema } from 'jsonschema';

const QueryParameterFilterSchema: Schema = {
  type: 'object',
  properties: {
    eq: { type: 'string' },
    lt: { type: 'string' },
    lte: { type: 'string' },
    gt: { type: 'string' },
    gte: { type: 'string' },
    between: {
      type: 'object',
      properties: {
        value1: { type: 'string' },
        value2: { type: 'string' }
      },
      required: ['value1', 'value2']
    },
    begins: { type: 'string' }
  },
  additionalProperties: false
};

export default QueryParameterFilterSchema;
