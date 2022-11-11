/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for assignUserToProject API
import { Schema } from 'jsonschema';

const AssignUserToProject: Schema = {
  id: '/assignUserToProject',
  type: 'object',
  properties: {
    role: { type: 'string' }
  },
  additionalProperties: false,
  required: ['role']
};

export default AssignUserToProject;
