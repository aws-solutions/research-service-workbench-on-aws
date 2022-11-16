/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for updateRole API
import { Schema } from 'jsonschema';

const UpdateUserSchema: Schema = {
  id: '/updateUser',
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    status: { enum: ['ACTIVE', 'INACTIVE'] },
    roles: { type: 'array', items: { type: 'string' } }
  },
  additionalProperties: false,
  required: []
};

export default UpdateUserSchema;
