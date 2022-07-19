// Schema for updateEnvironmentTypeConfig API
import { Schema } from 'jsonschema';

const UpdateEnvironmentTypeConfigSchema: Schema = {
  id: '/updateEnvironmentTypeConfig',
  type: 'object',
  properties: {
    allowedRoleIds: {
      type: 'array',
      items: { type: 'string' }
    },
    description: { type: 'string' },
    name: { type: 'string' },
    params: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: { type: 'string' }
      }
    }
  }
};

export default UpdateEnvironmentTypeConfigSchema;
