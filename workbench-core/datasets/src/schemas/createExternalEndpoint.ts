/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for createExternalEndpoint API
import { Schema } from 'jsonschema';

const CreateExternalEndpointSchema: Schema = {
  id: '/createExternalEndpoint',
  type: 'object',
  properties: {
    externalEndpointName: { type: 'string' },
    externalRoleName: { type: 'string' },
    kmsKeyArn: { type: 'string' },
    userId: { type: 'string' }
  },
  additionalProperties: false,
  required: ['externalEndpointName']
};

export default CreateExternalEndpointSchema;
