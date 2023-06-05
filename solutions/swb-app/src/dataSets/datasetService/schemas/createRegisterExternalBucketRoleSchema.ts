/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for createRegisterExternalBucketRoleSchema API
import { Schema } from 'jsonschema';

const CreateRegisterExternalBucketRoleSchema: Schema = {
  id: '/createExternalEndpoint',
  type: 'object',
  properties: {
    roleName: { type: 'string' },
    awsAccountId: { type: 'string' },
    awsBucketRegion: { type: 'string' },
    s3BucketArn: { type: 'string' },
    assumingAwsAccountId: { type: 'string' },
    externalId: { type: 'string' },
    kmsKeyArn: { type: 'string' }
  },
  additionalProperties: false,
  required: [
    'roleName',
    'awsAccountId',
    'awsBucketRegion',
    's3BucketArn',
    'assumingAwsAccountId',
    'externalId'
  ]
};

export default CreateRegisterExternalBucketRoleSchema;
