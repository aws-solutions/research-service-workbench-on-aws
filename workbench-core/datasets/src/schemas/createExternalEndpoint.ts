// Schema for createExternalEndpoint API
import { Schema } from 'jsonschema';

const CreateExternalEndpointSchema: Schema = {
  id: '/createExternalEndpoint',
  type: 'object',
  properties: {
    externalEndpointName: { type: 'string' },
    externalRoleName: { type: 'string' },
    kmsKeyArn: { type: 'string' }
  },
  additionalProperties: false,
  required: ['externalEndpointName']
};

export default CreateExternalEndpointSchema;
