/* eslint-disable */
import EnvironmentService from './environmentService';
import { mockClient } from 'aws-sdk-client-mock';
import {
  BatchGetItemCommandOutput,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  QueryCommand,
  QueryCommandOutput
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

describe('EnvironmentService', () => {
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const TABLE_NAME = 'exampleDDBTable';
  const envService = new EnvironmentService({ TABLE_NAME });
  const ddbMock = mockClient(DynamoDBClient);

  const env = {
    pk: 'ENV#44fd3490-2cdb-43fb-8459-4f08b3e6cd00',
    sk: 'ENV#44fd3490-2cdb-43fb-8459-4f08b3e6cd00',
    datasetIds: ['dataset-123'],
    id: '44fd3490-2cdb-43fb-8459-4f08b3e6cd00',
    cidr: '0.0.0.0/0',
    createdAt: '2022-05-13T20:03:54.055Z',
    description: 'test 123',
    envId: '44fd3490-2cdb-43fb-8459-4f08b3e6cd00',
    envType: 'sagemaker',
    envTypeConfigId: 'envTypeConfig-123',
    envTypeId: 'envType-123',
    name: 'testEnv',
    outputs: [],
    owner: 'owner-123',
    projectId: 'proj-123',
    status: 'PENDING',
    studyIds: ['study-123'],
    updatedAt: '2022-05-13T20:03:54.055Z',
    resourceType: 'environment',
    instance: 'instance-123'
  };
  describe('getEnvironment', () => {
    test('includeMetadata = false', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(env),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'ENV#44fd3490-2cdb-43fb-8459-4f08b3e6cd00',
            sk: 'ENV#44fd3490-2cdb-43fb-8459-4f08b3e6cd00'
          })
        })
        .resolves(getItemResponse);

      // OPERATE
      const actualResponse = await envService.getEnvironment('44fd3490-2cdb-43fb-8459-4f08b3e6cd00', false);

      // CHECK
      expect(actualResponse).toEqual(getItemResponse.Item);
    });

    test('includeMetadata = true', async () => {
      // BUILD
      const datasetItem = {
        resources: [
          {
            arn: 'arn:aws:s3:::123456789012-thingut6-par-sw-studydata/studies/Organization/org-study-1/'
          }
        ],
        updatedAt: '2022-05-18T20:33:42.608Z',
        createdAt: '2022-05-18T20:33:42.608Z',
        sk: 'DS#dataset-123',
        pk: 'ENV#44fd3490-2cdb-43fb-8459-4f08b3e6cd00',
        id: 'dataset-123',
        name: 'Study 1'
      };
      const envTypeConfigItem = {
        provisioningArtifactId: 'pa-3cwcuxmksf2xy',
        params: [
          {
            value: '${iamPolicyDocument}',
            key: 'IamPolicyDocument'
          },
          {
            value: 'ml.t3.medium',
            key: 'InstanceType'
          },
          {
            value: '0',
            key: 'AutoStopIdleTimeInMinutes'
          }
        ],
        updatedAt: '2022-05-18T20:33:42.608Z',
        createdAt: '2022-05-18T20:33:42.608Z',
        sk: 'ETC#envTypeConfig-123',
        pk: 'ENV#44fd3490-2cdb-43fb-8459-4f08b3e6cd00',
        id: 'envTypeConfig-123',
        productId: 'prod-t5q2vqlgvd76o'
      };
      const projItem = {
        hostingAccountEventBusArn: 'arn:aws:events:us-east-2:123456789012:event-bus/swb-dev-oh',
        subnetId: 'subnet-07f475d83291a3603',
        accountHandlerRoleArn: 'arn:aws:iam::<hosting-account-id>:role/swb-dev-va-cross-account-role',
        awsAccountId: '123456789012',
        environmentInstanceFiles: 's3://fake-s3-bucket-idvfndkjnwodw/environment-files',
        createdAt: '2022-05-18T20:33:42.608Z',
        vpcId: 'vpc-0b0bc7ae01d82e7b3',
        envMgmtRoleArn: 'arn:aws:iam::<hosting-account-id>:role/swb-dev-va-env-mgmt',
        name: 'Example project',
        encryptionKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/123',
        externalId: 'workbench',
        updatedAt: '2022-05-18T20:33:42.608Z',
        sk: 'PROJ#proj-123',
        pk: 'ENV#44fd3490-2cdb-43fb-8459-4f08b3e6cd00',
        id: 'proj-123'
      };

      const metaData = [datasetItem, envTypeConfigItem, projItem];
      const envWithMetadata = [env, ...metaData];
      const queryItemResponse: QueryCommandOutput = {
        Items: envWithMetadata.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };
      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          KeyConditionExpression: '#pk = :pk',
          ExpressionAttributeNames: {
            '#pk': 'pk'
          },
          ExpressionAttributeValues: {
            ':pk': {
              S: 'ENV#44fd3490-2cdb-43fb-8459-4f08b3e6cd00'
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.getEnvironment('44fd3490-2cdb-43fb-8459-4f08b3e6cd00', true);

      // CHECK
      expect(actualResponse).toEqual({
        DS: [datasetItem],
        ETC: envTypeConfigItem,
        PROJ: projItem,
        ...env
      });
    });
  });

  describe('getEnvironments', () => {
    test('admin with filter by status', async () => {
      // BUILD
      const items = [env, { ...env, id: '5d79a3a1-60b3-4825-a092-806a029c83f3' }];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByStatus',
          KeyConditionExpression: '#resourceType = :resourceType AND #status = :status',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType',
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            },
            ':status': {
              S: 'PENDING'
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.getEnvironments(
        { role: 'admin', ownerId: 'owner-123' },
        { status: 'PENDING' }
      );

      // CHECK
      expect(actualResponse).toEqual(items);
    });

    test('admin with no filter', async () => {
      // BUILD
      const items = [env, { ...env, id: '5d79a3a1-60b3-4825-a092-806a029c83f3' }];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByUpdatedAt',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.getEnvironments({ role: 'admin', ownerId: 'owner-123' });

      // CHECK
      expect(actualResponse).toEqual(items);
    });

    test('non admin', async () => {
      // BUILD
      const items = [{ ...env, ownerId: 'owner-123' }];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByOwner',
          KeyConditionExpression: '#resourceType = :resourceType AND #owner = :owner',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType',
            '#owner': 'owner'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            },
            ':owner': {
              S: 'owner-123'
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.getEnvironments({ role: 'researcher', ownerId: 'owner-123' });

      // CHECK
      expect(actualResponse).toEqual(items);
    });
  });
});
