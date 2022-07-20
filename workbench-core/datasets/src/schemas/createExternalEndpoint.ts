// Schema for createDataSet API
import { Schema } from 'jsonschema';

const CreateExternalEndpointSchema: Schema = {
  id: '/createExternalEndpoint',
  type: 'object',
  properties: {
    extenralEndpointName: { type: 'string' },
    externalRoleName: { type: 'string' },
    kmsKeyArn: { type: 'string' }
  },
  additionalProperties: false,
  required: ['externalEndpointName']
};

export default CreateExternalEndpointSchema;
