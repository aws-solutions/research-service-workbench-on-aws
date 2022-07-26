/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for updateRole API
import { Schema } from 'jsonschema';

const UpdateRoleSchema: Schema = {
  id: '/updateRole',
  type: 'object',
  properties: {
    username: { type: 'string' }
  },
  additionalProperties: false,
  required: ['username']
};

export default UpdateRoleSchema;
