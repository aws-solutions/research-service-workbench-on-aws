/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const rndUuid = '44fd3490-2cdb-43fb-8459-4f08b3e6cd00';
const envId = `env-${rndUuid}`;
jest.mock('uuid', () => ({ v4: () => rndUuid }));
import { DynamoDBService, JSONValue } from '@aws/workbench-core-base';
import {
  BatchGetItemCommand,
  BatchGetItemCommandOutput,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  TransactWriteItemsCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import * as Boom from '@hapi/boom';
import { mockClient } from 'aws-sdk-client-mock';
import { Environment, EnvironmentParser } from '../models/environments/environment';
import { EnvironmentService } from './environmentService';

describe('EnvironmentService', () => {
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });
  const ddbMock = mockClient(DynamoDBClient);
  const isoRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
  const tableName = 'exampleDDBTable';
  const dynamoDBService = new DynamoDBService({ region: process.env.AWS_REGION!, table: tableName });
  const envService = new EnvironmentService(dynamoDBService);

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
    productId: 'prod-t5q2vqlgvd76o',
    type: 'sagemakerNotebook'
  };

  const projectId = 'proj-123';

  const ddbEnv = {
    pk: `ENV#${envId}`,
    sk: `ENV#${envId}`,
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
    projectId: projectId,
    status: 'PENDING',
    studyIds: ['study-123'],
    type: envTypeConfigItem.sk,
    updatedAt: '2022-05-13T20:03:54.055Z',
    resourceType: 'environment',
    instanceId: 'instance-123',
    provisionedProductId: '',
    dependency: projectId,
    updatedBy: 'owner-123',
    createdBy: 'owner-123'
  };

  const envAPIResponse = EnvironmentParser.parse(ddbEnv);

  const ddbEnvItem = {
    id: envId,
    createdAt: '2022-05-13T20:03:54.055Z',
    description: 'test 123',
    envTypeConfigId: 'envTypeConfig-123',
    name: 'testEnv',
    owner: 'owner-123',
    status: 'PENDING',
    updatedAt: '2022-05-13T20:03:54.055Z',
    instanceId: 'instance-123',
    provisionedProductId: '',
    dependency: projectId
  };

  const toEnvItemResponse = (
    ddbEnv: Record<string, JSONValue>
  ): { dependency?: string; projectId: string } => {
    return {
      ...ddbEnv,
      dependency: undefined,
      projectId: projectId
    };
  };
  const dataSetKey = 'DATASET#dataset-123';
  const environmentKey = `ENV#${envId}`;

  const datasetItem = {
    resources: [
      {
        arn: 'arn:aws:s3:::123456789012-thingut6-par-sw-studydata/studies/Organization/org-study-1/'
      }
    ],
    updatedAt: '2022-05-18T20:33:42.608Z',
    createdAt: '2022-05-18T20:33:42.608Z',
    sk: dataSetKey,
    pk: environmentKey,
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
    externalId: 'sampleExternalId',
    updatedAt: '2022-05-18T20:33:42.608Z',
    sk: `PROJ#${projectId}`,
    pk: 'ENV#44fd3490-2cdb-43fb-8459-4f08b3e6cd00',
    id: projectId
  };

  const mockDateObject = new Date('2021-02-26T22:42:16.652Z');
  beforeEach(() => {
    jest.clearAllMocks();
    ddbMock.reset();

    jest.spyOn(Date, 'now').mockImplementationOnce(() => mockDateObject.getTime());
  });

  describe('getEnvironment', () => {
    test('includeMetadata = false', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(ddbEnv),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: tableName,
          Key: marshall({
            pk: `ENV#${envId}`,
            sk: `ENV#${envId}`
          })
        })
        .resolves(getItemResponse);

      // OPERATE
      const actualResponse = await envService.getEnvironment(envId, false);

      // CHECK
      expect(actualResponse).toEqual(envAPIResponse);
    });

    test('includeMetadata = true', async () => {
      // BUILD
      const metaData = [datasetItem, envTypeConfigItem, projItem, endpointItem];
      const envWithMetadata = [ddbEnv, ...metaData];
      const queryItemResponse: QueryCommandOutput = {
        Items: envWithMetadata.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };
      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
          KeyConditionExpression: '#pk = :pk',
          ExpressionAttributeNames: {
            '#pk': 'pk'
          },
          ExpressionAttributeValues: {
            ':pk': {
              S: `ENV#${envId}`
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.getEnvironment(envId, true);

      // CHECK
      expect(actualResponse).toEqual(
        EnvironmentParser.parse({
          DATASETS: [datasetItem],
          ENDPOINTS: [endpointItem],
          ETC: envTypeConfigItem,
          PROJ: projItem,
          ...envAPIResponse,
          provisionedProductId: '',
          error: undefined
        })
      );
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
          TableName: tableName,
          KeyConditionExpression: '#pk = :pk',
          ExpressionAttributeNames: {
            '#pk': 'pk'
          },
          ExpressionAttributeValues: {
            ':pk': {
              S: `ENV#${envId}`
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE n CHECK
      await expect(envService.getEnvironment(envId, true)).rejects.toThrow(`Could not find environment`);
    });

    test('env not found w/o includeMetadata', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: undefined,
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: tableName,
          Key: marshall({
            pk: `ENV#${envId}`,
            sk: `ENV#${envId}`
          })
        })
        .resolves(getItemResponse);

      // OPERATE n CHECK
      await expect(envService.getEnvironment(envId)).rejects.toThrow(`Could not find environment`);
    });
  });

  describe('getEnvironments', () => {
    const items = [ddbEnvItem, { ...ddbEnvItem, id: 'env-5d79a3a1-60b3-4825-a092-806a029c83f3' }];
    const responseItems = items.map((item) => toEnvItemResponse(item));
    test('with filter by status', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({ filter: { status: { eq: 'PENDING' } } });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('with filter by name', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({ filter: { name: { eq: 'testEnv' } } });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('with filter by createdAt', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({
        filter: {
          createdAt: { between: { value1: '2022-05-13T20:03:54.055Z', value2: '2022-05-13T20:03:54.055Z' } }
        }
      });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('with filter by project', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
              S: projectId
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironments({ filter: { dependency: { eq: projectId } } });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('with filter by owner', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({ filter: { owner: { eq: 'owner-123' } } });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('with filter by type', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({ filter: { type: { eq: 'envType-123' } } });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('should fail with too many filters', async () => {
      // OPERATE n CHECK
      await expect(
        envService.listEnvironments({ filter: { type: { eq: 'envType-123' }, owner: { eq: 'owner-123' } } })
      ).rejects.toThrow('Cannot apply more than one filter.');
    });

    test('with sort by status', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({ sort: { status: 'asc' } });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('with sort by name', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({ sort: { name: 'asc' } });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('with sort by name descending', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({ sort: { name: 'desc' } });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('with sort by createdAt', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({ sort: { createdAt: 'asc' } });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('with sort by dependency', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({ sort: { dependency: 'asc' } });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('with sort by owner', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({ sort: { owner: 'asc' } });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('with sort by type', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({ sort: { type: 'asc' } });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('should fail with too many sort attributes', async () => {
      // OPERATE n CHECK
      await expect(envService.listEnvironments({ sort: { type: 'asc', owner: 'asc' } })).rejects.toThrow(
        'Cannot sort by more than one attribute.'
      );
    });

    test('with no filter', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({});

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });
    test('with pagination token', async () => {
      // BUILD
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
          TableName: tableName,
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
      const actualResponse = await envService.listEnvironments({ pageSize: limit, paginationToken });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });

    test('with invalid pagination token', async () => {
      // BUILD
      const paginationToken =
        'eaJzayI6IkVOViNhM2VmZjdjZC1kNTM5LTRlZWMtODdiYy05MTcwMGJiZjZkZDIiLCJyZXNvdXJjZVR5cGUiOiJlbnZpcm9ubWVudCIsInBrIjoiRU5WI2EzZWZmN2NkLWQ1MzktNGVlYy04N2JjLTkxNzAwYmJmNmRkMiIsInVwZGF0ZWRBdCI6IjIwMjItMDYtMDFUMTg6NTI6MTguMTkyWiJ9';
      const limit = 1;

      // OPERATE n CHECK
      await expect(envService.listEnvironments({ pageSize: limit, paginationToken })).rejects.toThrow(
        'Invalid Pagination Token'
      );
    });
  });
  describe('listEnvironmentsByProject', () => {
    const items = [ddbEnvItem, { ...ddbEnvItem, id: 'env-5d79a3a1-60b3-4825-a092-806a029c83f3' }];
    const responseItems = items.map((item) => toEnvItemResponse(item));
    test('returns items with project', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      ddbMock
        .on(QueryCommand, {
          TableName: tableName,
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
              S: projectId
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await envService.listEnvironmentsByProject({ projectId: projectId });

      // CHECK
      expect(actualResponse.data).toEqual(responseItems);
    });
  });
  describe('updateEnvironment', () => {
    test('update environment', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(ddbEnv),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: tableName,
          Key: marshall({
            pk: `ENV#${envId}`,
            sk: `ENV#${envId}`
          })
        })
        .resolves(getItemResponse);
      ddbMock
        .on(UpdateItemCommand)
        //@ts-ignore
        .resolves({ Attributes: marshall({ ...ddbEnv, status: 'COMPLETED' }) });
      // OPERATE
      const actualResponse = await envService.updateEnvironment(envId, {
        status: 'COMPLETED'
      });

      // CHECK
      const updateCall = ddbMock.commandCalls(UpdateItemCommand)[0];
      expect(updateCall.args[0].input).toStrictEqual({
        TableName: tableName,
        Key: {
          pk: {
            S: `ENV#${envId}`
          },
          sk: {
            S: `ENV#${envId}`
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

      expect(actualResponse).toEqual({ ...envAPIResponse, status: 'COMPLETED' });
    });

    test('update environment fails when given a TERMINATED environment', async () => {
      const terminatedEnv: Environment = {
        id: envId,
        cidr: '0.0.0.0/0',
        createdAt: '2022-05-13T20:03:54.055Z',
        description: 'test 123',
        envTypeConfigId: 'envTypeConfig-123',
        name: 'testEnv',
        owner: 'owner-123',
        projectId: projectId,
        status: 'TERMINATED',
        updatedAt: '2022-05-13T20:03:54.055Z',
        instanceId: 'instance-123',
        provisionedProductId: ''
      };
      const mockGetEnv = jest.spyOn(envService, 'getEnvironment');
      mockGetEnv.mockImplementation(() => {
        return Promise.resolve(terminatedEnv);
      });

      await expect(
        envService.updateEnvironment(envId, {
          status: 'COMPLETED'
        })
      ).rejects.toThrow(Boom.badRequest(`Cannot update terminated environment`));

      mockGetEnv.mockRestore();
    });
  });

  describe('createEnvironment', () => {
    const createEnvReq = {
      instanceId: 'instance-123',
      cidr: '0.0.0.0/0',
      description: 'test 123',
      name: 'testEnv',
      outputs: [],
      envTypeId: 'envType-123',
      envTypeConfigId: 'envTypeConfig-123',
      projectId: projectId,
      datasetIds: ['dataset-123'],
      status: 'PENDING'
    };
    const authenticateUser = { roles: ['ITAdmin'], id: 'owner-123' };

    function getBatchItemsWith(resourceTypes: string[]): Partial<BatchGetItemCommandOutput> {
      const resources = [
        { ...envTypeConfigItem, resourceType: 'envTypeConfig' },
        { ...projItem, resourceType: 'project' },
        { ...datasetItem, resourceType: 'dataset' }
      ];
      const batchResponses = resources
        .filter((resource) => {
          return resourceTypes.includes(resource.resourceType);
        })
        .map((resource) => {
          return marshall(resource);
        });
      return {
        Responses: {
          [dynamoDBService.getTableName()]: batchResponses // Order is important
        }
      };
    }

    describe('with a valid request', () => {
      beforeEach(() => {
        // BUILD
        // Get env metadata
        const filteredBatchItems = getBatchItemsWith(['envTypeConfig', 'project', 'dataset']);
        ddbMock.on(BatchGetItemCommand).resolves(filteredBatchItems);

        // Write data to DDB
        ddbMock.on(TransactWriteItemsCommand).resolves({});

        // Get environment from DDB
        const metaData = [datasetItem, envTypeConfigItem, projItem];
        const envWithMetadata = [ddbEnv, ...metaData];
        const queryItemResponse: QueryCommandOutput = {
          Items: envWithMetadata.map((item) => {
            return marshall(item);
          }),
          $metadata: {}
        };
        ddbMock.on(QueryCommand).resolves(queryItemResponse);
      });

      test('creates a new environment', async () => {
        // OPERATE
        const actualResponse = await envService.createEnvironment(createEnvReq, authenticateUser);

        // CHECK
        expect(actualResponse).toEqual(
          EnvironmentParser.parse({
            DATASETS: [datasetItem],
            ENDPOINTS: [],
            ETC: envTypeConfigItem,
            PROJ: projItem,
            ...envAPIResponse,
            provisionedProductId: '',
            error: undefined
          })
        );
      });

      test('creates association objects for the mounted datasets', async () => {
        jest.spyOn(DynamoDBService.prototype, 'commitTransaction').mockImplementation(
          (
            params:
              | {
                  addPutRequests?: {
                    item: Record<string, JSONValue | Set<JSONValue>>;
                    conditionExpression?: string;
                    expressionAttributeNames?: Record<string, string>;
                    expressionAttributeValues?: Record<string, JSONValue | Set<JSONValue>>;
                  }[];
                  addPutItems?: Record<string, JSONValue | Set<JSONValue>>[];
                  addDeleteRequests?: Record<string, JSONValue | Set<JSONValue>>[];
                }
              | undefined
          ): Promise<void> => {
            const dataSetWithEnvironment = params!.addPutItems!.find((item) => {
              const pk = item.pk as string;
              const sk = item.sk as string;

              return pk === dataSetKey && sk === environmentKey;
            });

            expect(dataSetWithEnvironment).toEqual({
              pk: dataSetKey,
              sk: environmentKey,
              id: 'env-44fd3490-2cdb-43fb-8459-4f08b3e6cd00',
              projectId,
              createdAt: mockDateObject.toISOString(),
              updatedAt: mockDateObject.toISOString()
            });

            return Promise.resolve();
          }
        );

        try {
          await envService.createEnvironment(createEnvReq, authenticateUser);
        } catch (e) {
          console.error(e);
          throw new Error('Failed to create expected Dataset With Environment object');
        }
      });
    });

    test('failed because ETC does not exist', async () => {
      // BUILD
      const filteredBatchItems = getBatchItemsWith(['project', 'dataset']);
      ddbMock.on(BatchGetItemCommand).resolves(filteredBatchItems);

      // Write data to DDB
      ddbMock.on(TransactWriteItemsCommand).resolves({});

      // Get environment from DDB
      const metaData = [datasetItem, envTypeConfigItem, projItem];
      const envWithMetadata = [ddbEnv, ...metaData];
      const queryItemResponse: QueryCommandOutput = {
        Items: envWithMetadata.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };
      ddbMock.on(QueryCommand).resolves(queryItemResponse);

      // OPERATE && CHECK
      await expect(envService.createEnvironment(createEnvReq, authenticateUser)).rejects.toThrow(
        Boom.badRequest('Requested envTypeId with requested envTypeConfigId does not exist')
      );
    });

    test('failed because Project does not exist', async () => {
      // BUILD
      const filteredBatchItems = getBatchItemsWith(['envTypeConfig', 'dataset']);
      // @ts-ignore
      ddbMock.on(BatchGetItemCommand).resolves(filteredBatchItems);

      // Write data to DDB
      ddbMock.on(TransactWriteItemsCommand).resolves({});

      // Get environment from DDB
      const metaData = [datasetItem, envTypeConfigItem, projItem];
      const envWithMetadata = [ddbEnv, ...metaData];
      const queryItemResponse: QueryCommandOutput = {
        Items: envWithMetadata.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };
      ddbMock.on(QueryCommand).resolves(queryItemResponse);

      // OPERATE && CHECK
      await expect(envService.createEnvironment(createEnvReq, authenticateUser)).rejects.toThrow(
        Boom.badRequest(`projectId does not exist`)
      );
    });
    test('failed because Dataset does not exist', async () => {
      // BUILD
      const filteredBatchItems = getBatchItemsWith(['envTypeConfig', 'project']);
      ddbMock.on(BatchGetItemCommand).resolves(filteredBatchItems);

      // Write data to DDB
      ddbMock.on(TransactWriteItemsCommand).resolves({});

      // Get environment from DDB
      const metaData = [datasetItem, envTypeConfigItem, projItem];
      const envWithMetadata = [ddbEnv, ...metaData];
      const queryItemResponse: QueryCommandOutput = {
        Items: envWithMetadata.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };
      ddbMock.on(QueryCommand).resolves(queryItemResponse);

      // OPERATE && CHECK
      await expect(envService.createEnvironment(createEnvReq, authenticateUser)).rejects.toThrow(
        Boom.badRequest('datasetIds do not exist')
      );
    });
  });

  describe('doesDependencyHaveEnvironments', () => {
    describe('when dependencies exist', () => {
      beforeEach(() => {
        const queryMockResponse = { data: ['someDependency'] };
        jest
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .spyOn(DynamoDBService.prototype as any, 'getPaginatedItems')
          .mockImplementationOnce(() => queryMockResponse);
      });

      test('evaluates to true', async () => {
        // OPERATE
        const result = await envService.doesDependencyHaveEnvironments('dependency');

        // CHECK
        expect(result).toEqual(true);
      });
    });

    describe('when dependencies do not exist', () => {
      beforeEach(() => {
        const queryMockResponse = { data: [] };
        jest
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .spyOn(DynamoDBService.prototype as any, 'getPaginatedItems')
          .mockImplementationOnce(() => queryMockResponse);
      });

      test('evaluates to false', async () => {
        // OPERATE
        const result = await envService.doesDependencyHaveEnvironments('dependency');

        // CHECK
        expect(result).toEqual(false);
      });
    });
  });
});
