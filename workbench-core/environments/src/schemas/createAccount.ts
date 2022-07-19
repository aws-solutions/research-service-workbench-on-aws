// Schema for createAccount API
import { Schema } from 'jsonschema';

const CreateAccountSchema: Schema = {
  id: '/createAccount',
  type: 'object',
  properties: {
    id: { type: 'string' },
    awsAccountId: { type: 'string' },
    envMgmtRoleArn: { type: 'string' },
    error: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        value: { type: 'string' }
      }
    },
    hostingAccountHandlerRoleArn: { type: 'string' },
    vpcId: { type: 'string' },
    subnetId: { type: 'string' },
    cidr: { type: 'string' },
    environmentInstanceFiles: { type: 'string' },
    encryptionKeyArn: { type: 'string' },
    externalId: { type: 'string' },
    stackName: { type: 'string' },
    status: { type: 'string' }
  },
  required: [
    'awsAccountId',
    'envMgmtRoleArn',
    'hostingAccountHandlerRoleArn',
    'environmentInstanceFiles',
    'encryptionKeyArn'
  ]
};

export default CreateAccountSchema;
