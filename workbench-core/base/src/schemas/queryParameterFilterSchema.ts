/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// TODO: Any code that use this file should be refactored to use `queryStringParamFilter` or `queryNumberParamFilter`.
// This file has not been deleted because some feature branches uses this file. Keeping this file for now will help alleviate merge conflicts when the feature branch is merged into develop

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
