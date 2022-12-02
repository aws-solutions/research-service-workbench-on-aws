/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for createAccount API
import { Schema } from 'jsonschema';

const UpdateAccountSchema: Schema = {
  id: '/updateAccount',
  type: 'object',
  properties: {
    name: { type: 'string' }
  },
  additionalProperties: false,
  required: []
};

export default UpdateAccountSchema;
