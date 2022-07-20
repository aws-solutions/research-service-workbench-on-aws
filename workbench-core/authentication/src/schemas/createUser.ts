// Schema for createUser API
import { Schema } from 'jsonschema';

const CreateUserSchema: Schema = {
  id: '/createUser',
  type: 'object',
  properties: {
    uid: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    roles: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  additionalProperties: false,
  required: ['uid', 'firstname', 'lastName', 'email']
};

export default CreateUserSchema;
