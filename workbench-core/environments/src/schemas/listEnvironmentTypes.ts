/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for listEnvironmentType API
import { QueryParameterFilterSchema } from '@aws/workbench-core-base';
import { Schema } from 'jsonschema';

const ListEnvironmentTypesSchema: Schema = {
  id: '/listEnvironmentTypes',
  type: 'object',
  properties: {
    paginationToken: { type: 'string' },
    pageSize: { type: 'number' },
    filter: {
      type: 'object',
      properties: {
        name: QueryParameterFilterSchema,
        status: QueryParameterFilterSchema
      },
      additionalProperties: false
    },
    sort: {
      type: 'object',
      properties: {
        name: { enum: ['asc', 'desc'] },
        status: { enum: ['asc', 'desc'] }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
};

export default ListEnvironmentTypesSchema;
