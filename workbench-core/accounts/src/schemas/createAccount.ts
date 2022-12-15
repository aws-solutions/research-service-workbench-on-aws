/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for createAccount API
import { Schema } from 'jsonschema';

const CreateAccountSchema: Schema = {
  id: '/createAccount',
  type: 'object',
  properties: {
    name: { type: 'string' },
    awsAccountId: { type: 'string' },
    envMgmtRoleArn: { type: 'string' },
    hostingAccountHandlerRoleArn: { type: 'string' },
    externalId: { type: 'string' }
  },
  additionalProperties: false,
  required: ['awsAccountId', 'envMgmtRoleArn', 'hostingAccountHandlerRoleArn', 'name', 'externalId']
};

export default CreateAccountSchema;
