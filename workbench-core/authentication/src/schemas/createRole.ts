// Schema for createRole API
import { Schema } from 'jsonschema';

const CreateRoleSchema: Schema = {
  id: '/createRole',
  type: 'object',
  properties: {
    roleName: { type: 'string' }
  },
  additionalProperties: false,
  required: ['roleName']
};

export default CreateRoleSchema;
