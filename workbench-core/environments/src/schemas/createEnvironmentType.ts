/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for createEnvironmentType API
import { Schema } from 'jsonschema';

const CreateEnvironmentTypeSchema: Schema = {
  id: '/createEnvironmentType',
  type: 'object',
  properties: {
    productId: { type: 'string' },
    provisioningArtifactId: { type: 'string' },
    type: { type: 'string' },
    description: { type: 'string' },
    name: { type: 'string' },
    params: {
      type: 'object',
      additionalProperties: true
    },
    status: { enum: ['APPROVED', 'NOT_APPROVED'] }
  },
  additionalProperties: false,
  required: ['type', 'description', 'name', 'params', 'status']
};

export default CreateEnvironmentTypeSchema;
