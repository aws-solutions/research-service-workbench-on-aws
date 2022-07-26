/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const envId = '44fd3490-2cdb-43fb-8459-4f08b3e6cd00';
jest.mock('uuid', () => ({ v4: () => envId }));
import {
  BatchGetItemCommand,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  TransactWriteItemsCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { EnvironmentService } from './environmentService';

describe('EnvironmentService', () => {
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });
  const ddbMock = mockClient(DynamoDBClient);
  beforeEach(() => {
    jest.clearAllMocks();
    ddbMock.reset();
  });
  const isoRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
  const TABLE_NAME = 'exampleDDBTable';
  const envService = new EnvironmentService({ TABLE_NAME });
  const env = {
    pk: `ENV#${envId}`,
    sk: `ENV#${envId}`,
    datasetIds: ['dataset-123'],
    id: envId,
    cidr: '0.0.0.0/0',
    createdAt: '2022-05-13T20:03:54.055Z',
    description: 'test 123',
    envId,
    envType: 'sagemaker',
    envTypeConfigId: 'envTypeConfig-123',
    envTypeId: 'envType-123',
    name: 'testEnv',
    outputs: [],
    owner: 'owner-123',
    projectId: 'proj-123',
    status: 'PENDING',
    studyIds: ['study-123'],
    type: 'envType-123',
    updatedAt: '2022-05-13T20:03:54.055Z',
    resourceType: 'environment',
    instanceId: 'instance-123',
    provisionedProductId: '',
    dependency: 'proj-123',
    createdBy: 'user-1',
    updatedBy: 'user-1'
  };

  const datasetItem = {
    resources: [
      {
        arn: 'arn:aws:s3:::123456789012-thingut6-par-sw-studydata/studies/Organization/org-study-1/'
      }
    ],
    updatedAt: '2022-05-18T20:33:42.608Z',
    createdAt: '2022-05-18T20:33:42.608Z',
    sk: 'DATASET#dataset-123',
    pk: `ENV#${envId}`,
    id: 'dataset-123',
    name: 'Study 1'
  };
  const endpointItem = {
    updatedAt: '2022-05-18T20:33:42.608Z',
    createdAt: '2022-05-18T20:33:42.608Z',
    sk: 'ENDPOINT#endpoint-123',
    pk: `ENV#${envId}`,
    id: 'endpoint-123',
    dataSetId: datasetItem.id,
    endPointUrl: `s3://arn:aws:s3:someRegion:123456789012:accesspoint/${envId}`,
    path: 'samplePath'
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
    pk: `ENV#${envId}`,
    id: 'envTypeConfig-123',
    productId: 'prod-t5q2vqlgvd76o'
  };
  const projItem = {
    subnetId: 'subnet-07f475d83291a3603',
    hostingAccountHandlerRoleArn: 'arn:aws:iam::123456789012:role/swb-dev-va-cross-account-role',
    awsAccountId: '123456789012',
    environmentInstanceFiles: 's3://fake-s3-bucket-idvfndkjnwodw/environment-files',
    createdAt: '2022-05-18T20:33:42.608Z',
    vpcId: 'vpc-0b0bc7ae01d82e7b3',
    envMgmtRoleArn: 'arn:aws:iam::123456789012:role/swb-dev-va-env-mgmt',
    name: 'Example project',
    encryptionKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/123',
    externalId: 'workbench',
    updatedAt: '2022-05-18T20:33:42.608Z',
    sk: 'PROJ#proj-123',
    pk: 'ENV#44fd3490-2cdb-43fb-8459-4f08b3e6cd00',
    id: 'proj-123'
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
            pk: `ENV#${envId}`,
            sk: `ENV#${envId}`
          })
        })
        .resolves(getItemResponse);

      // OPERATE
      const actualResponse = await envService.getEnvironment(envId, false);

      // CHECK
      expect(actualResponse).toEqual(getItemResponse.Item);
    });

    test('includeMetadata = true', async () => {
      // BUILD
      const metaData = [datasetItem, envTypeConfigItem, projItem, endpointItem];
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
        DATASETS: [datasetItem],
        ENDPOINTS: [endpointItem],
        ETC: envTypeConfigItem,
        PROJ: projItem,
        ...env,
        provisionedProductId: '',
        error: undefined
      });
    });

    test('env not found w/ includeMetadata', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: [],
        $metadata: {},
        Count: 0
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

      // OPERATE n CHECK
      await expect(envService.getEnvironment('44fd3490-2cdb-43fb-8459-4f08b3e6cd00', true)).rejects.toThrow(
        'Could not find environment 44fd3490-2cdb-43fb-8459-4f08b3e6cd00'
      );
    });

    test('env not found w/o includeMetadata', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: undefined,
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: `ENV#${envId}`,
            sk: `ENV#${envId}`
          })
        })
        .resolves(getItemResponse);

      // OPERATE n CHECK
      await expect(envService.getEnvironment('44fd3490-2cdb-43fb-8459-4f08b3e6cd00')).rejects.toThrow(
        'Could not find environment 44fd3490-2cdb-43fb-8459-4f08b3e6cd00'
      );
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
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        { status: 'PENDING' }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with filter by name', async () => {
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
          IndexName: 'getResourceByName',
          KeyConditionExpression: '#resourceType = :resourceType AND #name = :name',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType',
            '#name': 'name'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            },
            ':name': {
              S: 'testEnv'
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        { name: 'testEnv' }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with filter by createdAt', async () => {
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
          IndexName: 'getResourceByCreatedAt',
          KeyConditionExpression:
            '#resourceType = :resourceType AND #createdAt BETWEEN :createdAt1 AND :createdAt2',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType',
            '#createdAt': 'createdAt'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            },
            ':createdAt1': {
              S: '2022-05-13T20:03:54.055Z'
            },
            ':createdAt2': {
              S: '2022-05-13T20:03:54.055Z'
            }
          },
          Limit: 50
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        { createdAtFrom: '2022-05-13T20:03:54.055Z', createdAtTo: '2022-05-13T20:03:54.055Z' }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with filter by project', async () => {
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
          IndexName: 'getResourceByDependency',
          KeyConditionExpression: '#resourceType = :resourceType AND #dependency = :dependency',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType',
            '#dependency': 'dependency'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            },
            ':dependency': {
              S: 'proj-123'
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        { project: 'proj-123' }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with filter by owner', async () => {
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
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        { owner: 'owner-123' }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with filter by type', async () => {
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
          IndexName: 'getResourceByType',
          KeyConditionExpression: '#resourceType = :resourceType AND #type = :type',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType',
            '#type': 'type'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            },
            ':type': {
              S: 'envType-123'
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        { type: 'envType-123' }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('should fail with too many filters', async () => {
      // OPERATE n CHECK
      await expect(
        envService.listEnvironments(
          { roles: ['Admin'], id: 'owner-123' },
          { type: 'envType-123', owner: 'owner-123' }
        )
      ).rejects.toThrow('Cannot apply more than one filter.');
    });

    test('admin with sort by status', async () => {
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
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            }
          },
          ScanIndexForward: true
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        undefined,
        undefined,
        undefined,
        { status: true }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with sort by name', async () => {
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
          IndexName: 'getResourceByName',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            }
          },
          ScanIndexForward: true
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        undefined,
        undefined,
        undefined,
        { name: true }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with sort by name descending', async () => {
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
          IndexName: 'getResourceByName',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            }
          },
          ScanIndexForward: false
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        undefined,
        undefined,
        undefined,
        { name: false }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with sort by createdAt', async () => {
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
          IndexName: 'getResourceByCreatedAt',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            }
          },
          ScanIndexForward: true
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        undefined,
        undefined,
        undefined,
        { createdAt: true }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with sort by project', async () => {
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
          IndexName: 'getResourceByDependency',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            }
          },
          ScanIndexForward: true
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        undefined,
        undefined,
        undefined,
        { project: true }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with sort by owner', async () => {
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
          IndexName: 'getResourceByOwner',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            }
          },
          ScanIndexForward: true
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        undefined,
        undefined,
        undefined,
        { owner: true }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with sort by type', async () => {
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
          IndexName: 'getResourceByType',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            }
          },
          ScanIndexForward: true
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        undefined,
        undefined,
        undefined,
        { type: true }
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('should fail with too many sort attributes', async () => {
      // OPERATE n CHECK
      await expect(
        envService.listEnvironments({ roles: ['Admin'], id: 'owner-123' }, undefined, undefined, undefined, {
          type: true,
          owner: true
        })
      ).rejects.toThrow('Cannot sort by more than one attribute.');
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
          IndexName: 'getResourceByCreatedAt',
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
      const actualResponse = await envService.listEnvironments({ roles: ['Admin'], id: 'owner-123' });

      // CHECK
      expect(actualResponse.data).toEqual(items);
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
      const actualResponse = await envService.listEnvironments({ roles: ['Researcher'], id: 'owner-123' });

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with pagination token', async () => {
      // BUILD
      const items = [env, { ...env, id: '5d79a3a1-60b3-4825-a092-806a029c83f3' }];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };
      const lastEvaluatedKey = {
        sk: 'ENV#a3eff7cd-d539-4eec-87bc-91700bbf6dd2',
        resourceType: 'environment',
        pk: 'ENV#a3eff7cd-d539-4eec-87bc-91700bbf6dd2',
        createdAt: '2022-06-01T18:52:18.192Z'
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const limit = 1;

      ddbMock
        .on(QueryCommand, {
          TableName: 'exampleDDBTable',
          IndexName: 'getResourceByCreatedAt',
          KeyConditionExpression: '#resourceType = :resourceType',
          ExpressionAttributeNames: {
            '#resourceType': 'resourceType'
          },
          ExpressionAttributeValues: {
            ':resourceType': {
              S: 'environment'
            }
          },
          Limit: limit,
          ExclusiveStartKey: {
            sk: { S: 'ENV#a3eff7cd-d539-4eec-87bc-91700bbf6dd2' },
            resourceType: { S: 'environment' },
            pk: { S: 'ENV#a3eff7cd-d539-4eec-87bc-91700bbf6dd2' },
            createdAt: { S: '2022-06-01T18:52:18.192Z' }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments(
        { roles: ['Admin'], id: 'owner-123' },
        undefined,
        limit,
        paginationToken
        // undefined
      );

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });

    test('admin with invalid pagination token', async () => {
      // BUILD
      const paginationToken =
        'eaJzayI6IkVOViNhM2VmZjdjZC1kNTM5LTRlZWMtODdiYy05MTcwMGJiZjZkZDIiLCJyZXNvdXJjZVR5cGUiOiJlbnZpcm9ubWVudCIsInBrIjoiRU5WI2EzZWZmN2NkLWQ1MzktNGVlYy04N2JjLTkxNzAwYmJmNmRkMiIsInVwZGF0ZWRBdCI6IjIwMjItMDYtMDFUMTg6NTI6MTguMTkyWiJ9';
      const limit = 1;

      // OPERATE n CHECK
      await expect(
        envService.listEnvironments({ roles: ['Admin'], id: 'owner-123' }, undefined, limit, paginationToken)
      ).rejects.toThrow('Invalid paginationToken');
    });
  });

  describe('updateEnvironment', () => {
    test('update environment', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(env),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: `ENV#${envId}`,
            sk: `ENV#${envId}`
          })
        })
        .resolves(getItemResponse);
      ddbMock
        .on(UpdateItemCommand)
        //@ts-ignore
        .resolves({ Attributes: marshall({ ...env, status: 'COMPLETED' }) });

      // OPERATE
      const actualResponse = await envService.updateEnvironment(envId, {
        status: 'COMPLETED'
      });

      // CHECK
      const updateCall = ddbMock.commandCalls(UpdateItemCommand)[0];
      expect(updateCall.args[0].input).toMatchObject({
        TableName: 'exampleDDBTable',
        Key: {
          pk: {
            S: 'ENV#44fd3490-2cdb-43fb-8459-4f08b3e6cd00'
          },
          sk: {
            S: 'ENV#44fd3490-2cdb-43fb-8459-4f08b3e6cd00'
          }
        },
        ReturnValues: 'ALL_NEW',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#createdAt': 'createdAt',
          '#updatedAt': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':status': {
            S: 'COMPLETED'
          },
          ':createdAt': {
            S: expect.stringMatching(isoRegex)
          },
          ':updatedAt': {
            S: expect.stringMatching(isoRegex)
          }
        },
        UpdateExpression:
          'SET #status = :status, #createdAt = if_not_exists(#createdAt, :createdAt), #updatedAt = :updatedAt'
      });

      expect(actualResponse).toEqual({ ...env, status: 'COMPLETED' });
    });
  });

  describe('createEnvironment', () => {
    test('create environment', async () => {
      // BUILD
      // Get env metadata
      const batchItems = {
        Responses: {
          [TABLE_NAME]: [
            marshall({ ...envTypeConfigItem, resourceType: 'envTypeConfig' }),
            marshall({ ...projItem, resourceType: 'project' }),
            marshall({ ...datasetItem, resourceType: 'dataset' })
          ] // Order is important
        }
      };
      // @ts-ignore
      ddbMock.on(BatchGetItemCommand).resolves(batchItems);

      // Write data to DDB
      ddbMock.on(TransactWriteItemsCommand).resolves({});

      // Get environment from DDB
      const metaData = [datasetItem, envTypeConfigItem, projItem];
      const envWithMetadata = [env, ...metaData];
      const queryItemResponse: QueryCommandOutput = {
        Items: envWithMetadata.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };
      ddbMock.on(QueryCommand).resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.createEnvironment(
        {
          instanceId: 'instance-123',
          cidr: '0.0.0.0/0',
          description: 'test 123',
          name: 'testEnv',
          outputs: [],
          envTypeId: 'envType-123',
          envTypeConfigId: 'envTypeConfig-123',
          projectId: 'proj-123',
          datasetIds: ['dataset-123'],
          status: 'PENDING'
        },
        { roles: ['Admin'], id: 'owner-123' }
      );

      // CHECK
      expect(actualResponse).toEqual({
        DATASETS: [datasetItem],
        ENDPOINTS: [],
        ETC: envTypeConfigItem,
        PROJ: projItem,
        ...env,
        provisionedProductId: '',
        error: undefined
      });
    });
  });
});
