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
    storageName: { type: 'string' },
    path: { type: 'string' },
    awsAccountId: { type: 'string' },
    region: { type: 'string' },
    owner: { type: 'string' },
    ownerType: { type: 'string' },
    permissions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          identity: { type: 'string' },
          identityType: { type: 'string' },
          accessLevel: { type: 'string' }
        }
      }
    }
  },
  additionalProperties: false,
  required: ['datasetName', 'storageName', 'path', 'awsAccountId', 'region']
};

export default CreateDataSetSchema;
