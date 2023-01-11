/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for ListProjects API
import { QueryParameterFilterSchema } from '@aws/workbench-core-base';
import { Schema } from 'jsonschema';

const ListProjectsSchema: Schema = {
  id: '/listProjects',
  type: 'object',
  properties: {
    user: { type: 'AuthenticatedUser' },
    pageSize: { type: 'number' },
    paginationToken: { type: 'string' },
    filter: {
      type: 'object',
      properties: {
        name: QueryParameterFilterSchema,
        status: QueryParameterFilterSchema,
        createdAt: QueryParameterFilterSchema,
        dependency: QueryParameterFilterSchema
      },
      additionalProperties: false
    },
    sort: {
      type: 'object',
      properties: {
        name: { enum: ['asc', 'desc'] },
        status: { enum: ['asc', 'desc'] },
        createdAt: { enum: ['asc', 'desc'] },
        dependency: { enum: ['asc', 'desc'] }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false,
  required: ['user']
};

export default ListProjectsSchema;
