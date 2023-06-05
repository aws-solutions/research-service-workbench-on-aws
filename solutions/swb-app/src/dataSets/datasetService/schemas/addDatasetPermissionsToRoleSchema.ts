/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for addDatasetPermissionsToRoleSchema API
import { Schema } from 'jsonschema';

const AddDatasetPermissionsToRoleSchema: Schema = {
  id: '/createExternalEndpoint',
  type: 'object',
  properties: {
    roleString: { type: 'string' },
    accessPointArn: { type: 'string' },
    datasetPrefix: { type: 'string' }
  },
  additionalProperties: false,
  required: ['roleString', 'accessPointArn', 'datasetPrefix']
};

export default AddDatasetPermissionsToRoleSchema;
