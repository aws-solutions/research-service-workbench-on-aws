// Schema for updateRole API
import { Schema } from 'jsonschema';

const UpdateRoleSchema: Schema = {
  id: '/updateRole',
  type: 'object',
  properties: {
    userName: { type: 'string' }
  },
  additionalProperties: false,
  required: ['userName']
};

export default UpdateRoleSchema;
