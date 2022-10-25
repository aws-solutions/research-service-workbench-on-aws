/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for createAccount API
import { Schema } from 'jsonschema';

const CreateProjectSchema: Schema = {
  id: '/createProject',
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    costCenterId: { type: 'string' }
  },
  additionalProperties: false,
  required: ['name', 'description', 'costCenterId']
};

export default CreateProjectSchema;
