// Schema for createDataSet API
import { Schema } from 'jsonschema';

const CreateDataSetSchema: Schema = {
  id: '/createDataSet',
  type: 'object',
  properties: {
    datasetName: { type: 'string' },
    storageName: { type: 'string' },
    path: { type: 'string' },
    awsAccountId: { type: 'string' }
  },
  additionalProperties: false,
  required: ['datasetName', 'storageName', 'path', 'awsAccountId']
};

export default CreateDataSetSchema;
