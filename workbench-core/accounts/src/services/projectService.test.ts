/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const expectedUuid = '123';
const projId = `proj-${expectedUuid}`;
jest.mock('uuid', () => ({ v4: () => expectedUuid }));

import {
  BatchGetItemCommand,
  BatchGetItemCommandOutput,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  QueryCommand,
  QueryCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandOutput
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import {
  AuthenticatedUser,
  CreateGroupRequest,
  CreateGroupResponse,
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse,
  DynamicAuthorizationService,
  GetUserGroupsRequest,
  GetUserGroupsResponse,
  IdentityPermission
} from '@aws/workbench-core-authorization';
import { DynamoDBService, JSONValue } from '@aws/workbench-core-base';
import Getter from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/getter';
import { UpdateUnmarshalledOutput } from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/interfaces/updateUnmarshalledOutput';
import Query from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/query';
import Updater from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/updater';
import * as Boom from '@hapi/boom';
import { mockClient } from 'aws-sdk-client-mock';
import { ProjectStatus } from '../constants/projectStatus';
import { DeleteProjectRequest } from '../models/projects/deleteProjectRequest';
import { Project } from '../models/projects/project';
import { UpdateProjectRequest } from '../models/projects/updateProjectRequest';
import CostCenterService from './costCenterService';
import ProjectService from './projectService';

describe('ProjectService', () => {
  const ddbMock = mockClient(DynamoDBClient);
  const TABLE_NAME = 'exampleDDBTable';
  const dynamoDBService = new DynamoDBService({
    region: process.env.AWS_REGION!,
    table: TABLE_NAME
  });
  const dynamicAuthZ = {} as DynamicAuthorizationService;
  const costCenterService = new CostCenterService(dynamoDBService);
  const projService = new ProjectService(dynamoDBService, dynamicAuthZ, costCenterService);
  const timestamp = '2022-05-18T20:33:42.608Z';
  const mockDateObject = new Date(timestamp);
  const user: AuthenticatedUser = {
    id: 'user-123',
    roles: []
  };
  let projects: Project[];
  const project1: Project = {
    id: 'proj-123',
    name: 'name1',
    description: '',
    costCenterId: 'cc-1',
    status: ProjectStatus.AVAILABLE,
    createdAt: '2022-11-10T04:19:00.000Z',
    updatedAt: '',
    awsAccountId: '',
    envMgmtRoleArn: '',
    hostingAccountHandlerRoleArn: '',
    vpcId: '',
    subnetId: '',
    environmentInstanceFiles: '',
    encryptionKeyArn: '',
    externalId: '',
    accountId: ''
  };
  const project2: Project = {
    id: 'proj-456',
    name: 'name2',
    description: '',
    costCenterId: 'cc-2',
    status: ProjectStatus.SUSPENDED,
    createdAt: '2022-11-10T04:20:00.000Z',
    updatedAt: '',
    awsAccountId: '',
    envMgmtRoleArn: '',
    hostingAccountHandlerRoleArn: '',
    vpcId: '',
    subnetId: '',
    environmentInstanceFiles: '',
    encryptionKeyArn: '',
    externalId: '',
    accountId: ''
  };
  const project3: Project = {
    id: 'proj-789',
    name: 'name3',
    description: '',
    costCenterId: 'cc-3',
    status: ProjectStatus.DELETED,
    createdAt: '2022-11-10T04:21:00.000Z',
    updatedAt: '',
    awsAccountId: '',
    envMgmtRoleArn: '',
    hostingAccountHandlerRoleArn: '',
    vpcId: '',
    subnetId: '',
    environmentInstanceFiles: '',
    encryptionKeyArn: '',
    externalId: '',
    accountId: ''
  };

  // DDB object for project1
  const projItem1: Record<string, string> = {
    ...project1,
    pk: `PROJ#proj-123`,
    sk: `PROJ#proj-123`,
    resourceType: 'project',
    dependency: project1.costCenterId
  };
  delete projItem1.costCenterId;
  // DDB object for project2
  const projItem2: Record<string, string> = {
    ...project2,
    pk: `PROJ#proj-456`,
    sk: `PROJ#proj-456`,
    resourceType: 'project',
    dependency: project2.costCenterId
  };
  delete projItem2.costCenterId;
  // DDB object for project3
  const projItem3: Record<string, string> = {
    ...project3,
    pk: `PROJ#proj-789`,
    sk: `PROJ#proj-789`,
    resourceType: 'project',
    dependency: project3.costCenterId
  };
  delete projItem3.costCenterId;

  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementationOnce(() => mockDateObject.getTime());
    projects = [project1, project2, project3];
  });

  // Project object
  const proj: Project = {
    hostingAccountHandlerRoleArn: 'arn:aws:iam::1234566789:role/swb-dev-va-cross-account-role',
    accountId: 'acc-123',
    awsAccountId: '123456789012',
    createdAt: timestamp,
    description: 'Example project',
    costCenterId: 'cc-123',
    encryptionKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/123',
    environmentInstanceFiles: 's3://fake-s3-bucket-idvfndkjnwodw/environment-files',
    envMgmtRoleArn: 'arn:aws:iam::123456789012:role/swb-dev-va-env-mgmt',
    externalId: 'workbench',
    id: `${projId}`,
    name: 'Example project',
    subnetId: 'subnet-07f475d83291a3603',
    updatedAt: timestamp,
    vpcId: 'vpc-0b0bc7ae01d82e7b3',
    status: ProjectStatus.AVAILABLE
  };

  // DDB object for project item
  const projItem: Record<string, string> = {
    ...proj,
    pk: `PROJ#${projId}`,
    sk: `PROJ#${projId}`,
    resourceType: 'project',
    dependency: proj.costCenterId
  };
  delete projItem.costCenterId;

  // DDB object for cost item
  const costCenterItem = {
    pk: 'CC#cc-123',
    sk: 'CC#cc-123',
    hostingAccountHandlerRoleArn: 'arn:aws:iam::1234566789:role/swb-dev-va-cross-account-role',
    awsAccountId: '123456789012',
    createdAt: timestamp,
    description: 'Example cost center',
    dependency: 'acc-123',
    encryptionKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/123',
    environmentInstanceFiles: 's3://fake-s3-bucket-idvfndkjnwodw/environment-files',
    envMgmtRoleArn: 'arn:aws:iam::123456789012:role/swb-dev-va-env-mgmt',
    externalId: 'workbench',
    id: 'cc-123',
    name: 'Example cost center',
    subnetId: 'subnet-07f475d83291a3603',
    updatedAt: timestamp,
    vpcId: 'vpc-0b0bc7ae01d82e7b3'
  };

  const noUserGroupsFunction = jest.fn((request: GetUserGroupsRequest): Promise<GetUserGroupsResponse> => {
    return Promise.resolve({
      data: {
        groupIds: []
      }
    });
  });

  const itAdminUserGroupsFunction = jest.fn(
    (request: GetUserGroupsRequest): Promise<GetUserGroupsResponse> => {
      return Promise.resolve({
        data: {
          groupIds: ['ITAdmin']
        }
      });
    }
  );

  const getMultipleNonITGroupsFunction = jest.fn(
    (request: GetUserGroupsRequest): Promise<GetUserGroupsResponse> => {
      return Promise.resolve({
        data: {
          groupIds: ['proj-123#PA', 'proj-456#PA', 'proj-789#PA']
        }
      });
    }
  );

  const getSingleNonITGroupFunction = jest.fn(
    (request: GetUserGroupsRequest): Promise<GetUserGroupsResponse> => {
      return Promise.resolve({
        data: {
          groupIds: ['proj-123#PA']
        }
      });
    }
  );

  describe('listProjects', () => {
    test('should fail on list projects for negative pageSize', async () => {
      // BUILD
      const pageSize = -1;

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // OPERATE n CHECK
      await expect(() => projService.listProjects({ user, pageSize })).rejects.toThrow(
        'Please supply a non-negative page size.'
      );
    });

    test('list all projects with no group membership', async () => {
      // BUILD
      dynamicAuthZ.getUserGroups = noUserGroupsFunction;

      // OPERATE
      const actualResponse = await projService.listProjects({ user });

      // CHECK
      expect(actualResponse).toEqual({ data: [] });
    });

    test('list projects as IT Admin when no projects exist', async () => {
      // BUILD
      const queryItemResponse: QueryCommandOutput = {
        $metadata: {}
      };

      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;

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
              S: 'project'
            }
          },
          Limit: 50
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({ user });

      // CHECK
      expect(actualResponse.data).toEqual([]);
    });

    test('list all projects as IT Admin on 1 page', async () => {
      // BUILD
      const items = [projItem];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;

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
              S: 'project'
            }
          },
          Limit: 50
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({ user });

      // CHECK
      expect(actualResponse.data).toEqual([proj]);
    });

    test('list all projects as IT Admin on 1 page with filter on createdAt', async () => {
      // BUILD
      const items = [projItem];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;

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
              S: 'project'
            },
            ':createdAt1': {
              S: 'date1'
            },
            ':createdAt2': {
              S: 'date2'
            }
          },
          Limit: 50
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        filter: { createdAt: { between: { value1: 'date1', value2: 'date2' } } }
      });

      // CHECK
      expect(actualResponse.data).toEqual([proj]);
    });

    test('list all projects as IT Admin on 1 page with filter on dependency', async () => {
      // BUILD
      const items = [projItem];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;

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
              S: 'project'
            },
            ':dependency': {
              S: 'cc-123'
            }
          },
          Limit: 50
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        filter: { dependency: { eq: 'cc-123' } }
      });

      // CHECK
      expect(actualResponse.data).toEqual([proj]);
    });

    test('list all projects as IT Admin on 1 page with filter on status', async () => {
      // BUILD
      const items = [projItem];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;

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
              S: 'project'
            },
            ':status': {
              S: 'AVAILABLE'
            }
          },
          Limit: 50
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        filter: { status: { eq: 'AVAILABLE' } }
      });

      // CHECK
      expect(actualResponse.data).toEqual([proj]);
    });

    test('list all projects as IT Admin on 1 page with filter on name', async () => {
      // BUILD
      const items = [projItem];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;

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
              S: 'project'
            },
            ':name': {
              S: 'Example project'
            }
          },
          Limit: 50
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        filter: { name: { eq: 'Example project' } }
      });

      // CHECK
      expect(actualResponse.data).toEqual([proj]);
    });

    test('list all projects as IT Admin on 1 page with sort on createdAt', async () => {
      // BUILD
      const items = [projItem];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;

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
              S: 'project'
            }
          },
          Limit: 50,
          ScanIndexForward: true
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        sort: { createdAt: 'asc' }
      });

      // CHECK
      expect(actualResponse.data).toEqual([proj]);
    });

    test('list all projects as IT Admin on 1 page with sort on dependency', async () => {
      // BUILD
      const items = [projItem];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;

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
              S: 'project'
            }
          },
          Limit: 50,
          ScanIndexForward: true
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        sort: { dependency: 'asc' }
      });

      // CHECK
      expect(actualResponse.data).toEqual([proj]);
    });

    test('list all projects as IT Admin on 1 page with sort on status', async () => {
      // BUILD
      const items = [projItem];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;

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
              S: 'project'
            }
          },
          Limit: 50,
          ScanIndexForward: true
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        sort: { status: 'asc' }
      });

      // CHECK
      expect(actualResponse.data).toEqual([proj]);
    });

    test('list all projects as IT Admin on 1 page with sort on name', async () => {
      // BUILD
      const items = [projItem];
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        $metadata: {}
      };

      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;

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
              S: 'project'
            }
          },
          Limit: 50,
          ScanIndexForward: true
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        sort: { name: 'asc' }
      });

      // CHECK
      expect(actualResponse.data).toEqual([proj]);
    });

    test('list all projects as IT Admin on more than 1 page -- getting first page', async () => {
      // BUILD
      const items = [projItem, projItem];
      const lastEvaluatedKey = {
        pk: projItem.pk,
        sk: projItem.sk,
        resourceType: projItem.resourceType,
        createdAt: projItem.createdAt
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 2;
      const expectedResponse = { data: [proj, proj], paginationToken: paginationToken };
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        LastEvaluatedKey: marshall(lastEvaluatedKey),
        $metadata: {}
      };

      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;

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
              S: 'project'
            }
          },
          Limit: pageSize
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({ user, pageSize });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });

    test('list all projects as IT Admin on more than 1 page -- getting page with pagination token', async () => {
      // BUILD
      const items = [projItem, projItem];
      const lastEvaluatedKey = {
        pk: projItem.pk,
        sk: projItem.sk,
        resourceType: projItem.resourceType,
        createdAt: projItem.createdAt
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 2;
      const expectedResponse = { data: [proj, proj], paginationToken: paginationToken };
      const queryItemResponse: QueryCommandOutput = {
        Items: items.map((item) => {
          return marshall(item);
        }),
        LastEvaluatedKey: marshall(lastEvaluatedKey),
        $metadata: {}
      };

      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;

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
              S: 'project'
            }
          },
          Limit: pageSize
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({ user, pageSize, paginationToken });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });

    test('list projects when user is only part of 1 groups', async () => {
      dynamicAuthZ.getUserGroups = getSingleNonITGroupFunction;

      const getItemResponse: Record<string, JSONValue> = projItem;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(DynamoDBService.prototype as any, 'getItem').mockImplementationOnce(() => getItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects({ user });

      // CHECK
      expect(actualResponse.data).toEqual([proj]);
    });

    test('list all projects as user in multiple groups on 1 page when pageSize > number of projects', async () => {
      // BUILD
      const items = [projItem1, projItem2, projItem3];
      const pageSize = 4;
      const expectedResponse = { data: projects, paginationToken: undefined };

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({ user, pageSize });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });

    test('list all projects as user in multiple groups on 1 page exactly', async () => {
      // BUILD
      const items = [projItem1, projItem2, projItem3];
      const lastEvaluatedKey = {
        pk: projItem3.pk,
        sk: projItem3.sk
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 3;
      const expectedResponse = { data: projects, paginationToken: paginationToken };

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({ user, pageSize });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });

    test('list all projects as user of multiple groups on 1 page with filter on createdAt', async () => {
      // BUILD
      const items = [projItem1, projItem2, projItem3];

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        filter: {
          createdAt: { between: { value1: '2022-11-10T04:19:00.000Z', value2: '2022-11-10T04:20:00.000Z' } }
        }
      });

      // CHECK
      expect(actualResponse.data).toEqual([project1, project2]);
    });

    test('list all projects as user of multiple groups on 1 page with filter on dependency', async () => {
      // BUILD
      const items = [projItem1, projItem2, projItem3];

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock getBatchItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        filter: { dependency: { eq: 'cc-1' } }
      });

      // CHECK
      expect(actualResponse.data).toEqual([project1]);
    });

    test('list all projects as user of multiple groups on 1 page with filter on status', async () => {
      // BUILD
      const items = [projItem1, projItem2, projItem3];

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        filter: { status: { eq: 'AVAILABLE' } }
      });

      // CHECK
      expect(actualResponse.data).toEqual([project1]);
    });

    test('list all projects as user of multiple groups on 1 page with filter on name', async () => {
      // BUILD
      const items = [projItem1, projItem2, projItem3];

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        filter: { name: { begins: 'name' } }
      });

      // CHECK
      expect(actualResponse.data).toEqual([project1, project2, project3]);
    });

    test('list all projects as user of multiple groups on 1 page with sort on createdAt', async () => {
      // BUILD
      const items = [projItem1, projItem2, projItem3];

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        sort: { createdAt: 'asc' }
      });

      // CHECK
      expect(actualResponse.data).toEqual([project1, project2, project3]);
    });

    test('list all projects as user of multiple groups on 1 page with sort on dependency', async () => {
      // BUILD
      const items = [projItem1, projItem2, projItem3];

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        sort: { dependency: 'asc' }
      });

      // CHECK
      expect(actualResponse.data).toEqual([project1, project2, project3]);
    });

    test('list all projects as user of multiple groups on 1 page with sort on status', async () => {
      // BUILD
      const items = [projItem1, projItem2, projItem3];

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        sort: { status: 'asc' }
      });

      // CHECK
      expect(actualResponse.data).toEqual([project1, project3, project2]);
    });

    test('list all projects as user of multiple groups on 1 page with sort on name', async () => {
      // BUILD
      const items = [projItem1, projItem2, projItem3];

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({
        user,
        sort: { name: 'desc' }
      });

      // CHECK
      expect(actualResponse.data).toEqual([project3, project2, project1]);
    });

    test('list all projects as user in multiple groups on next page with pagination token', async () => {
      // BUILD
      const items = [projItem1, projItem2, projItem3];
      const lastEvaluatedKey = {
        pk: projItem2.pk,
        sk: projItem2.sk
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 2;
      const expectedResponse = { data: [project3], paginationToken: undefined };

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({ user, pageSize, paginationToken });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });

    test('list all projects as user in multiple groups on next page with pagination token with more to get', async () => {
      // BUILD
      const items = [projItem1, projItem1, projItem2, projItem3, projItem3];
      const lastEvaluatedKey = {
        pk: projItem2.pk,
        sk: projItem2.sk
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 1;
      const expectedResponse = {
        data: [project3],
        paginationToken: Buffer.from(JSON.stringify({ pk: projItem3.pk, sk: projItem3.sk })).toString(
          'base64'
        )
      };

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({ user, pageSize, paginationToken });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });

    test('should fail on list projects for use of multiple projects with invalid paginationToken', async () => {
      // BUILD
      const items = [projItem1, projItem2, projItem3];
      const lastEvaluatedKey = {
        pk: 'notPk',
        sk: 'notSk'
      };
      const paginationToken = Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64');
      const pageSize = 1;

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: {
          exampleDDBTable: items.map((item) => {
            return marshall(item);
          })
        },
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE n CHECK
      await expect(() => projService.listProjects({ user, pageSize, paginationToken })).rejects.toThrow(
        'Pagination token is invalid.'
      );
    });

    test('list all projects as user in multiple groups but nothing is returned from DDB', async () => {
      // BUILD
      const expectedResponse = {
        data: [],
        paginationToken: undefined
      };

      dynamicAuthZ.getUserGroups = getMultipleNonITGroupsFunction;

      // mock batchGetItems call
      const batchGetItems: BatchGetItemCommandOutput = {
        Responses: undefined,
        $metadata: {}
      };
      ddbMock.on(BatchGetItemCommand).resolves(batchGetItems);

      // OPERATE
      const actualResponse = await projService.listProjects({ user });

      // CHECK
      expect(actualResponse).toEqual(expectedResponse);
    });
  });

  describe('getProject', () => {
    test('getting 1 project', async () => {
      // BUILD
      const getItemResponse: Record<string, JSONValue> = projItem;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(DynamoDBService.prototype as any, 'getItem').mockImplementationOnce(() => getItemResponse);

      // OPERATE
      const actualResponse = await projService.getProject({ projectId: 'proj-123' });

      // CHECK
      expect(actualResponse).toEqual(proj);
    });

    test('getting no object', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: undefined,
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'PROJ#proj-123',
            sk: 'PROJ#proj-123'
          })
        })
        .resolves(getItemResponse);

      // OPERATE & CHECk
      await expect(projService.getProject({ projectId: 'proj-123' })).rejects.toThrow(
        'Could not find project proj-123'
      );
    });
  });

  describe('createProject', () => {
    const user: AuthenticatedUser = {
      id: 'user-456',
      roles: []
    };

    beforeEach(() => {
      dynamicAuthZ.getUserGroups = itAdminUserGroupsFunction;
      dynamicAuthZ.createGroup = jest.fn((request: CreateGroupRequest): Promise<CreateGroupResponse> => {
        return Promise.resolve({
          data: {
            groupId: 'proj-123#PA'
          }
        });
      });

      const identityPermission: IdentityPermission = {
        action: 'CREATE',
        effect: 'ALLOW',
        subjectType: '',
        subjectId: '',
        identityType: 'GROUP',
        identityId: ''
      };

      dynamicAuthZ.createIdentityPermissions = jest.fn(
        (request: CreateIdentityPermissionsRequest): Promise<CreateIdentityPermissionsResponse> => {
          return Promise.resolve({
            data: {
              identityPermissions: [identityPermission]
            }
          });
        }
      );
    });

    test('create a project with valid name', async () => {
      // BUILD
      const params = {
        name: proj.name,
        description: proj.description,
        costCenterId: proj.costCenterId
      };

      // mock isProjectNameInUse call
      const isProjectNameValidQueryItemResponse: QueryCommandOutput = {
        Count: 0,
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
              S: 'project'
            },
            ':name': {
              S: 'Example project'
            }
          }
        })
        .resolves(isProjectNameValidQueryItemResponse);

      // mock getCostCenter call
      const getCostCenterGetItemResponse: GetItemCommandOutput = {
        Item: marshall(costCenterItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'CC#cc-123',
            sk: 'CC#cc-123'
          })
        })
        .resolves(getCostCenterGetItemResponse);

      // mock ddb update item
      ddbMock.on(UpdateItemCommand).resolves({});

      // mock final get Project after success
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(projItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: `PROJ#${projId}`,
            sk: `PROJ#${projId}`
          })
        })
        .resolves(getItemResponse);

      // OPERATE
      const actualResponse = await projService.createProject(params, user);

      // CHECK
      expect(actualResponse).toEqual(proj);
    });

    test('fail on create a project with name already in use', async () => {
      // BUILD
      const params = {
        name: proj.name,
        description: proj.description,
        costCenterId: proj.costCenterId
      };

      // mock isProjectNameInUse call
      const isProjectNameValidQueryItemResponse: QueryCommandOutput = {
        Items: [marshall(projItem)],
        Count: 1,
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
              S: 'project'
            },
            ':name': {
              S: 'Example project'
            }
          }
        })
        .resolves(isProjectNameValidQueryItemResponse);

      // mock getCostCenter call
      const getCostCenterGetItemResponse: GetItemCommandOutput = {
        Item: marshall(costCenterItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'CC#cc-123',
            sk: 'CC#cc-123'
          })
        })
        .resolves(getCostCenterGetItemResponse);

      // OPERATE n CHECK
      await expect(projService.createProject(params, user)).rejects.toThrow(
        'Project name "Example project" is in use by a non deleted project. Please use another name.'
      );
    });

    test('fail on create a project with invalid cost center id', async () => {
      // BUILD
      const params = {
        name: proj.name,
        description: proj.description,
        costCenterId: proj.costCenterId
      };

      // mock isProjectNameInUse call
      const isProjectNameValidQueryItemResponse: QueryCommandOutput = {
        Count: 0,
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
              S: 'project'
            },
            ':name': {
              S: 'Example project'
            }
          }
        })
        .resolves(isProjectNameValidQueryItemResponse);

      // mock getCostCenter call
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'CC#cc-123',
            sk: 'CC#cc-123'
          })
        })
        .resolves({});

      // OPERATE n CHECK
      await expect(projService.createProject(params, user)).rejects.toThrow(
        'Could not find cost center cc-123'
      );
    });

    test('fail on update to DDB call', async () => {
      // BUILD
      const params = {
        name: proj.name,
        description: proj.description,
        costCenterId: proj.costCenterId
      };

      // mock isProjectNameInUse call
      const isProjectNameValidQueryItemResponse: QueryCommandOutput = {
        Count: 0,
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
              S: 'project'
            },
            ':name': {
              S: 'Example project'
            }
          }
        })
        .resolves(isProjectNameValidQueryItemResponse);

      // mock getCostCenter call
      const getCostCenterGetItemResponse: GetItemCommandOutput = {
        Item: marshall(costCenterItem),
        $metadata: {}
      };
      ddbMock
        .on(GetItemCommand, {
          TableName: 'exampleDDBTable',
          Key: marshall({
            pk: 'CC#cc-123',
            sk: 'CC#cc-123'
          })
        })
        .resolves(getCostCenterGetItemResponse);

      // mock update to DDB
      ddbMock.on(UpdateItemCommand).rejects('Failed to update DDB');

      // OPERATE n CHECK
      await expect(projService.createProject(params, user)).rejects.toThrow('Failed to create project');
    });
  });

  describe('updateProject', () => {
    let projectName: string;
    let projectDescription: string;
    let updatedProject1: Project;
    let updatedProjItem1: typeof projItem1;

    let projectId: string;
    let updatedValues: Record<string, string>;
    let request: UpdateProjectRequest;

    beforeEach(() => {
      projectName = project1.name;
      projectDescription = project1.description;
      request = { projectId, updatedValues };
      updatedProject1 = {
        ...project1,
        name: projectName,
        description: projectDescription
      };

      updatedProjItem1 = {
        ...updatedProject1,
        pk: `PROJ#${project1.id}`,
        sk: `PROJ#${project1.id}`,
        resourceType: 'project',
        dependency: updatedProject1.costCenterId
      };
    });

    describe('if empty string was passed', () => {
      beforeEach(() => {
        request.projectId = updatedProject1.id;
        request.updatedValues = { name: '', description: '' };
      });

      test('it should fail', async () => {
        await expect(() => projService.updateProject(request)).rejects.toThrow(
          'You must supply a new nonempty name and/or description to update the project.'
        );
      });
    });

    describe('if nothing was passed to update', () => {
      beforeEach(() => {
        request.projectId = updatedProject1.id;
        request.updatedValues = {};
      });

      test('it should fail', async () => {
        await expect(() => projService.updateProject(request)).rejects.toThrow(
          'You must supply a new nonempty name and/or description to update the project.'
        );
      });
    });

    describe('trying to update project name', () => {
      let updateItemResponse: UpdateUnmarshalledOutput;

      describe('if project does not exist', () => {
        beforeEach(() => {
          projectName = 'New Project Name';
          updatedProject1.name = projectName;
          request.projectId = 'Invalid project id';
          request.updatedValues = { name: projectName };

          // mock get project ddb call
          const getItemResponse: GetItemCommandOutput = {
            Item: undefined,
            $metadata: {}
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          jest.spyOn(Getter.prototype as any, 'execute').mockImplementationOnce(() => getItemResponse);

          // mock query name ddb call
          const queryItemResponse: QueryCommandOutput = {
            Items: [],
            $metadata: {},
            Count: 0
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          jest.spyOn(Query.prototype as any, 'execute').mockImplementationOnce(() => queryItemResponse);
        });

        test('it should fail', async () => {
          await expect(() => projService.updateProject(request)).rejects.toThrow(
            `Could not find project ${request.projectId}`
          );
        });
      });

      describe('if project exists', () => {
        beforeEach(() => {
          projectName = 'New Project Name';
          updatedProject1.name = projectName;
          request.projectId = 'Invalid project id';
          request.updatedValues = { name: projectName };

          // mock get project ddb call
          const getItemResponse: Record<string, JSONValue> = projItem1;
          jest
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .spyOn(DynamoDBService.prototype as any, 'getItem')
            .mockImplementationOnce(() => getItemResponse);
        });

        describe('and name is already in use', () => {
          beforeEach(() => {
            projectName = 'Existing Project Name';
            updatedProject1.name = projectName;
            request.projectId = updatedProject1.id;
            request.updatedValues = { name: projectName };

            // mock query name ddb call
            const queryItemResponse: QueryCommandOutput = {
              Items: [marshall(projItem1)],
              $metadata: {}
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            jest.spyOn(Query.prototype as any, 'execute').mockImplementationOnce(() => queryItemResponse);
          });

          test('it should fail', async () => {
            await expect(() => projService.updateProject(request)).rejects.toThrow(
              `Project name "${projectName}" is in use by a non deleted project. Please use another name.`
            );
          });
        });

        describe('and name is not in use', () => {
          beforeEach(() => {
            projectName = 'New Project Name';
            updatedProject1.name = projectName;
            updatedProjItem1.name = projectName;
            request.projectId = updatedProject1.id;
            request.updatedValues = { name: projectName };

            // mock query name ddb call
            const queryItemResponse: QueryCommandOutput = {
              Items: [],
              $metadata: {},
              Count: 0
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            jest.spyOn(Query.prototype as any, 'execute').mockImplementationOnce(() => queryItemResponse);

            jest
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .spyOn(DynamoDBService.prototype as any, 'updateExecuteAndFormat')
              .mockImplementationOnce(() => updateItemResponse);
          });

          describe('and update succeeds', () => {
            beforeEach(() => {
              // mock update project ddb call
              updateItemResponse = {
                Attributes: updatedProjItem1
              };
            });

            test('it should pass', async () => {
              // OPERATE
              const actualResponse = await projService.updateProject(request);

              // CHECK
              expect(actualResponse).toEqual(updatedProject1);
            });
          });

          describe('and update fails', () => {
            beforeEach(() => {
              // mock update project ddb call
              updateItemResponse = {
                Attributes: undefined
              };
            });

            test('it should fail', async () => {
              // OPERATE n CHECK
              await expect(() => projService.updateProject(request)).rejects.toThrow(
                'Could not update project.'
              );
            });
          });
        });
      });
    });

    describe('trying to update project description', () => {
      beforeEach(() => {
        projectDescription = 'New Project Description';
        updatedProject1.description = projectDescription;
        updatedProjItem1.description = projectDescription;
        request.updatedValues = { description: projectDescription };
      });

      describe('if projectId is invalid', () => {
        beforeEach(() => {
          request.projectId = 'Invalid project id';

          // mock get project ddb call
          const getItemResponse: GetItemCommandOutput = {
            Item: undefined,
            $metadata: {}
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          jest.spyOn(Getter.prototype as any, 'execute').mockImplementationOnce(() => getItemResponse);
        });

        test('it should fail', async () => {
          await expect(() => projService.updateProject(request)).rejects.toThrow(
            `Could not find project ${request.projectId}`
          );
        });
      });

      describe('if projectId is valid', () => {
        let updateItemResponse: UpdateUnmarshalledOutput;
        beforeEach(() => {
          request.projectId = updatedProject1.id;

          // mock get project ddb call
          const getItemResponse: Record<string, JSONValue> = projItem1;
          jest
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .spyOn(DynamoDBService.prototype as any, 'getItem')
            .mockImplementationOnce(() => getItemResponse);

          jest
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .spyOn(DynamoDBService.prototype as any, 'updateExecuteAndFormat')
            .mockImplementationOnce(() => updateItemResponse);
        });

        describe('and update succeeds', () => {
          beforeEach(() => {
            // mock update project ddb call
            updateItemResponse = {
              Attributes: updatedProjItem1
            };
          });

          test('it should pass', async () => {
            // OPERATE
            const actualResponse = await projService.updateProject(request);

            // CHECK
            expect(actualResponse).toEqual(updatedProject1);
          });
        });

        describe('and update fails', () => {
          beforeEach(() => {
            // mock update project ddb call
            updateItemResponse = {
              Attributes: undefined
            };
          });

          test('it should fail', async () => {
            // OPERATE n CHECK
            await expect(() => projService.updateProject(request)).rejects.toThrow(
              'Could not update project.'
            );
          });
        });
      });
    });
  });

  describe('softDeleteProject', () => {
    const deletedProject1: Project = {
      ...project1,
      status: ProjectStatus.DELETED
    };

    const deletedProjItem1 = {
      ...deletedProject1,
      pk: `PROJ#${project1.id}`,
      sk: `PROJ#${project1.id}`,
      resourceType: 'deleted_project',
      dependency: deletedProject1.costCenterId
    };

    let projectId: string;
    let request: DeleteProjectRequest;
    let checkDependency = async function (projectId: string): Promise<void> {
      return;
    };

    beforeEach(() => {
      request = { authenticatedUser: user, projectId };
      checkDependency = async function (projectId: string): Promise<void> {
        return;
      };
    });

    describe('if project does not exist', () => {
      beforeEach(() => {
        request.projectId = 'invalid-proj-id';

        // mock get project ddb call
        const getItemResponse: GetItemCommandOutput = {
          Item: undefined,
          $metadata: {}
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn(Getter.prototype as any, 'execute').mockImplementationOnce(() => getItemResponse);
      });

      test('it should fail', async () => {
        // OPERATE n CHECK
        await expect(() => projService.softDeleteProject(request, checkDependency)).rejects.toThrow(
          `Could not find project ${request.projectId}`
        );
      });
    });

    describe('if projectId is valid', () => {
      beforeEach(() => {
        request.projectId = deletedProject1.id;

        // mock get project ddb call
        const getItemResponse: GetItemCommandOutput = {
          Item: marshall(deletedProjItem1),
          $metadata: {}
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn(Getter.prototype as any, 'execute').mockImplementationOnce(() => getItemResponse);
      });

      describe('if dependencies exist', () => {
        describe('of type environment', () => {
          beforeEach(() => {
            checkDependency = async function (projectId: string): Promise<void> {
              throw Boom.conflict(
                `Project ${projectId} cannot be deleted because it has environments(s) associated with it`
              );
            };
          });

          test('it should fail', async () => {
            // OPERATE n CHECK
            await expect(() => projService.softDeleteProject(request, checkDependency)).rejects.toThrow(
              `Project ${request.projectId} cannot be deleted because it has environments(s) associated with it`
            );
          });
        });

        describe('of type dataset', () => {
          beforeEach(() => {
            checkDependency = async function (projectId: string): Promise<void> {
              throw Boom.conflict(
                `Project ${projectId} cannot be deleted because it has dataset(s) associated with it`
              );
            };
          });

          test('it should fail', async () => {
            // OPERATE n CHECK
            await expect(() => projService.softDeleteProject(request, checkDependency)).rejects.toThrow(
              `Project ${request.projectId} cannot be deleted because it has dataset(s) associated with it`
            );
          });
        });

        describe('of type environment type config', () => {
          beforeEach(() => {
            checkDependency = async function (projectId: string): Promise<void> {
              throw Boom.conflict(
                `Project ${projectId} cannot be deleted because it has environment type config(s) associated with it`
              );
            };
          });

          test('it should fail', async () => {
            // OPERATE n CHECK
            await expect(() => projService.softDeleteProject(request, checkDependency)).rejects.toThrow(
              `Project ${request.projectId} cannot be deleted because it has environment type config(s) associated with it`
            );
          });
        });
      });

      describe('if dependencies do not exist', () => {
        let updateItemResponse: UpdateItemCommandOutput;
        beforeEach(() => {
          jest
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .spyOn(Updater.prototype as any, 'execute')
            .mockImplementationOnce(() => updateItemResponse);
        });

        describe('and DDB update succeeds', () => {
          beforeEach(() => {
            // mock update project ddb call
            updateItemResponse = {
              Attributes: marshall(deletedProjItem1),
              $metadata: {}
            };
          });

          test('it should pass', async () => {
            // OPERATE n CHECK
            await expect(() => projService.softDeleteProject(request, checkDependency)).resolves;
          });
        });
      });
    });
  });
});
