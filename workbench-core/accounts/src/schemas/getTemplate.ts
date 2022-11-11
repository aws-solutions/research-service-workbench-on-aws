/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for GetTemplate API
import { Schema } from 'jsonschema';

const GetTemplateSchema: Schema = {
    id: '/getTemplate',
    type: 'object',
    properties: {
        awsAccountId: { type: 'string' },
        externalId: { type: 'string' }
    },
    additionalProperties: false,
    required: ['awsAccountId', 'externalId']
};

export default GetTemplateSchema;
