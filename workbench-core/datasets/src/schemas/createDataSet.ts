/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for createDataSet API
import { Schema } from 'jsonschema';

const CreateDataSetSchema: Schema = {
  id: '/createDataSet',
  type: 'object',
  properties: {
    datasetName: { type: 'string' },
    path: { type: 'string' },
    description: { type: 'string' },
    customMetadata: {
      type: 'object',
      properties: {
        owningProjectId: { type: 'string' }
      },
      additionalProperties: false,
      required: ['owningProjectId']
    }
  },
  additionalProperties: false,
  required: ['datasetName', 'path', 'customMetadata']
};

export default CreateDataSetSchema;
