/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for updateEnvironmentTypeConfig API
import { Schema } from 'jsonschema';

const UpdateEnvironmentTypeSchema: Schema = {
  id: '/updateEnvironmentType',
  type: 'object',
  properties: {
    description: { type: 'string' },
    name: { type: 'string' },
    status: { enum: ['APPROVED', 'NOT_APPROVED'] }
  },
  additionalProperties: false
};

export default UpdateEnvironmentTypeSchema;
