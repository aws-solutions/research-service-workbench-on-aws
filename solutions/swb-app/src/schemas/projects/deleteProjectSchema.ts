/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for deleteAccount API
import { Schema } from 'jsonschema';

const DeleteProjectSchema: Schema = {
  id: '/deleteProject',
  type: 'object',
  properties: {
    projectId: { type: 'string' }
  },
  additionalProperties: false,
  required: ['projectId']
};

export default DeleteProjectSchema;
