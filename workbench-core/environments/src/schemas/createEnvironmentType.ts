// Schema for createEnvironmentType API
import { Schema } from 'jsonschema';

const CreateEnvironmentTypeSchema: Schema = {
  id: '/createEnvironmentType',
  type: 'object',
  properties: {
    productId: { type: 'string' },
    provisioningArtifact: { type: 'string' },
    allowedRoleIds: {
      type: 'array',
      items: { type: 'string' }
    },
    type: { type: 'string' },
    description: { type: 'string' },
    name: { type: 'string' },
    params: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: true
      }
    },
    status: { enum: ['APPROVED', 'NOT_APPROVED'] }
  },
  additionalProperties: false,
  required: ['allowedRoleIds', 'type', 'description', 'name', 'params', 'status']
};

export default CreateEnvironmentTypeSchema;
