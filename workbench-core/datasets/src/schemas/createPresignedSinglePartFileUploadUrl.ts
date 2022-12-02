/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for createExternalEndpoint API
import { Schema } from 'jsonschema';

const CreatePresignedSinglePartFileUploadUrl: Schema = {
  id: '/createPresignedSinglePartFileUploadUrl',
  type: 'object',
  properties: {
    fileName: { type: 'string' }
  },
  additionalProperties: false,
  required: ['fileName']
};

export default CreatePresignedSinglePartFileUploadUrl;
