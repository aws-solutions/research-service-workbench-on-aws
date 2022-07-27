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
    awsAccountId: { type: 'string' },
    envMgmtRoleArn: { type: 'string' },
    hostingAccountHandlerRoleArn: { type: 'string' },
    vpcId: { type: 'string' },
    subnetId: { type: 'string' },
    cidr: { type: 'string' },
    environmentInstanceFiles: { type: 'string' },
    encryptionKeyArn: { type: 'string' },
    externalId: { type: 'string' }
  },
  additionalProperties: false,
  required: [
    'awsAccountId',
    'envMgmtRoleArn',
    'hostingAccountHandlerRoleArn',
    'environmentInstanceFiles',
    'encryptionKeyArn'
  ]
};

export default CreateAccountSchema;
