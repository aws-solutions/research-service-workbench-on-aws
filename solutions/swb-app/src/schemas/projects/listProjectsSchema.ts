/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for ListProjects API
import { Schema } from 'jsonschema';

const ListProjectsSchema: Schema = {
  id: '/listProjects',
  type: 'object',
  properties: {
    pageSize: { type: 'number' },
    paginationToken: { type: 'string' }
  },
  additionalProperties: false,
  required: []
};

export default ListProjectsSchema;
