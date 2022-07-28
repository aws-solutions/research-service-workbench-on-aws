/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for updateEnvironmentTypeConfig API
import { Schema } from 'jsonschema';

const UpdateEnvironmentTypeConfigSchema: Schema = {
  id: '/updateEnvironmentTypeConfig',
  type: 'object',
  properties: {
    allowedRoleIds: {
      type: 'array',
      items: { type: 'string' }
    },
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
  additionalProperties: false
};

export default UpdateEnvironmentTypeConfigSchema;
