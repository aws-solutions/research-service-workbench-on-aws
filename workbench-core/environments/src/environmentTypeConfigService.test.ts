/* eslint-disable */
import EnvironmentTypeConfigService from './environmentTypeConfigService';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, GetItemCommand, GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import environmentResourceTypeToKey from './environmentResourceTypeToKey';
import { marshall } from '@aws-sdk/util-dynamodb';

describe('environmentTypeConfigService', () => {
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });
  const ddbMock = mockClient(DynamoDBClient);
  beforeEach(() => {
    jest.clearAllMocks();
    ddbMock.reset();
  });
  const TABLE_NAME = 'exampleDDBTable';
  const envTypeConfigService = new EnvironmentTypeConfigService({ TABLE_NAME });
  const envTypeId = '1b0502f3-121f-4d63-b03a-44dc756e4c20';
  const envTypeConfigId = '';
  const envTypeConfig = {
    createdAt: '2022-06-17T16:28:40.360Z',
    updatedBy: 'owner-123',
    createdBy: 'owner-123',
    name: 'config 1',
    allowRoleIds: [],
    resourceType: 'envTypeConfig',
    provisioningArtifactId: 'pa-dewjn123',
    params: [],
    updatedAt: '2022-06-17T21:25:24.333Z',
    sk: `${environmentResourceTypeToKey.envType}#${envTypeId}${environmentResourceTypeToKey.envTypeConfig}#${envTypeConfigId}`,
    owner: 'owner-123',
    description: 'Example config 1',
    id: envTypeConfigId,
    pk: 'ETC',
    productId: 'prod-dasjk123',
    type: 'sagemaker'
  };

  describe('getEnvironmentTypeConfig', () => {
    test('valid id', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(envTypeConfig),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: TABLE_NAME,
          Key: marshall({
            pk: environmentResourceTypeToKey.envTypeConfig,
            sk: `${environmentResourceTypeToKey.envType}#${envTypeId}${environmentResourceTypeToKey.envTypeConfig}#${envTypeConfigId}`
          })
        })
        .resolves(getItemResponse);

      // OPERATE
      const actualResponse = await envTypeConfigService.getEnvironmentTypeConfig(envTypeId, envTypeConfigId);

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
      await expect(envTypeConfigService.getEnvironmentTypeConfig(invalidId, invalidId)).rejects.toThrow(
        `Could not find environment type config ${invalidId}`
      );
    });
  });

  describe('getEnvironmentTypeConfigs', () => {
    test('validPaginationToken', async () => {});
    test('invalidPaginationToken', async () => {});
  });

  describe('updateEnvironmentTypeConfig', () => {
    test('valid id', async () => {});

    test('invalid id', async () => {});
  });

  describe('createNewEnvironmentTypeConfig', () => {
    test('successfully create envTypeConfig', async () => {});

    test('failed to create envTypeConfig', async () => {});
  });
});
