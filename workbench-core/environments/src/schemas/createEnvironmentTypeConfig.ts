// Schema for createEnvironmentTypeConfig API
import { Schema } from 'jsonschema';

const CreateEnvironmentTypeConfigSchema: Schema = {
  id: '/createEnvironmentTypeConfig',
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
    }
  },
  additionalProperties: false,
  required: ['allowedRoleIds', 'type', 'description', 'name', 'params']
};

export default CreateEnvironmentTypeConfigSchema;
