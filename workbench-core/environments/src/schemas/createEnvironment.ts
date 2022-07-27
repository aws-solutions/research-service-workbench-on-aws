/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for createEnvironment API
import { Schema } from 'jsonschema';

const CreateEnvironmentSchema: Schema = {
  id: '/createEnvironment',
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    envTypeId: { type: 'string' },
    envTypeConfigId: { type: 'string' },
    envType: { type: 'string' },
    projectId: { type: 'string' },
    datasetIds: { type: 'array', items: { type: 'string' } }
  },
  required: ['name', 'description', 'envTypeId', 'envTypeConfigId', 'envType', 'projectId', 'datasetIds'],
  additionalProperties: false
};

export default CreateEnvironmentSchema;
