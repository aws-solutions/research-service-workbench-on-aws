/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for createUser API
import { Schema } from 'jsonschema';

const CreateUserSchema: Schema = {
  id: '/createUser',
  type: 'object',
  properties: {
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' }
  },
  additionalProperties: false,
  required: ['firstName', 'lastName', 'email']
};

export default CreateUserSchema;
