/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for createEnvironmentTypeConfig API
import { Schema } from 'jsonschema';

const CreateEnvironmentTypeConfigSchema: Schema = {
  id: '/createEnvironmentTypeConfig',
  type: 'object',
  properties: {
    allowedRoleIds: {
      type: 'array',
      items: { type: 'string' }
    },
    type: { type: 'string' },
    description: { type: 'string' },
    name: { type: 'string' },
    params: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: true
      }
    }
  },
  additionalProperties: false,
  required: ['allowedRoleIds', 'type', 'description', 'name', 'params']
};

export default CreateEnvironmentTypeConfigSchema;
