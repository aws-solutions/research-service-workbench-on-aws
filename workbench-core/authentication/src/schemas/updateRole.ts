// Schema for updateRole API
import { Schema } from 'jsonschema';

const UpdateRoleSchema: Schema = {
  id: '/updateRole',
  type: 'object',
  properties: {
    username: { type: 'string' }
  },
  additionalProperties: false,
  required: ['username']
};

export default UpdateRoleSchema;
