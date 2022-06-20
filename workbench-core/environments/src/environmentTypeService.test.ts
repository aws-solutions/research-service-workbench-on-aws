/* eslint-disable */
import EnvironmentTypeService from './environmentTypeService';
import { DynamoDBClient, GetItemCommand, GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import environmentResourceTypeToKey from './environmentResourceTypeToKey';
const envTypeId = '6a00ee50-6274-4050-9357-1062caa5b916';
jest.mock('uuid', () => ({ v4: () => envTypeId }));

describe('environmentTypeService', () => {
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });
  const ddbMock = mockClient(DynamoDBClient);
  beforeEach(() => {
    jest.clearAllMocks();
    ddbMock.reset();
  });
  const TABLE_NAME = 'exampleDDBTable';
  const envTypeService = new EnvironmentTypeService({ TABLE_NAME });
  const envType = {
    status: 'APPROVED',
    createdAt: '2022-06-20T18:32:09.985Z',
    updatedBy: 'owner-123',
    createdBy: 'owner-123',
    name: 'Jupyter Notebook',
    resourceType: 'envType',
    provisioningArtifactId: 'pa-dqwijdnwq12',
    params: [],
    updatedAt: '2022-06-20T18:36:14.358Z',
    sk: `ET#${envTypeId}`,
    owner: 'owner-123',
    description: 'An Amazon SageMaker Jupyter Notebook',
    id: envTypeId,
    pk: `ET#${envTypeId}`,
    productId: 'prod-dwqdqdqdwq',
    type: 'sagemaker'
  };
  describe('getEnvironmentType', () => {
    test('valid id', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(envType),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: TABLE_NAME,
          Key: marshall({
            pk: `${environmentResourceTypeToKey.envType}#${envTypeId}`,
            sk: `${environmentResourceTypeToKey.envType}#${envTypeId}`
          })
        })
        .resolves(getItemResponse);

      // OPERATE
      const actualResponse = await envTypeService.getEnvironmentType(envTypeId);

      // CHECK
      expect(actualResponse).toEqual(getItemResponse.Item);
    });

    test('invalid id', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: undefined,
        $metadata: {}
      };
      ddbMock.on(GetItemCommand).resolves(getItemResponse);
      const invalidId = 'invalidId-1';

      // OPERATE & CHECK
      await expect(envTypeService.getEnvironmentType(invalidId)).rejects.toThrow(
        `Could not find environment type ${invalidId}`
      );
    });
  });
  describe('getEnvironmentTypes', () => {
    test('validPaginationToken', async () => {});
    test('invalidPaginationToken', async () => {});
  });

  describe('updateEnvironmentType', () => {
    test('valid id', async () => {});

    test('invalid id', async () => {});
  });

  describe('createNewEnvironmentType', () => {
    test('successfully create envType', async () => {});

    test('failed to create envType', async () => {});
  });
});
