/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for GetProject API
import { Schema } from 'jsonschema';

const GetProjectSchema: Schema = {
  id: '/getProject',
  type: 'object',
  properties: {
    projectId: { type: 'string' }
  },
  additionalProperties: false,
  required: ['projectId']
};

export default GetProjectSchema;
