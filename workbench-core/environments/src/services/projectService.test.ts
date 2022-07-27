/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  QueryCommand,
  QueryCommandOutput
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import ProjectService from './projectService';

describe('ProjectService', () => {
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const ddbMock = mockClient(DynamoDBClient);
  const TABLE_NAME = 'exampleDDBTable';
  const projService = new ProjectService({ TABLE_NAME });

  const projItem = {
    pk: 'PROJ#proj-123',
    sk: 'PROJ#proj-123',
    accountHandlerRoleArn: 'arn:aws:iam::1234566789:role/swb-dev-va-cross-account-role',
    accountId: 'acc-123',
    awsAccountId: '123456789012',
    createdAt: '2022-05-18T20:33:42.608Z',
    createdBy: 'abc',
    desc: 'Example project',
    encryptionKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/123',
    environmentInstanceFiles: 's3://fake-s3-bucket-idvfndkjnwodw/environment-files',
    envMgmtRoleArn: 'arn:aws:iam::123456789012:role/swb-dev-va-env-mgmt',
    externalId: 'workbench',
    id: 'proj-123',
    indexId: 'index-123',
    name: 'Example project',
    projectAdmins: [],
    resourceType: 'project',
    subnetId: 'subnet-07f475d83291a3603',
    updatedAt: '2022-05-18T20:33:42.608Z',
    updatedBy: 'abc',
    vpcId: 'vpc-0b0bc7ae01d82e7b3'
  };

  describe('getProjects', () => {
    test('getting all projects', async () => {
      // BUILD
      const items = [projItem];
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
              S: 'project'
            }
          }
        })
        .resolves(queryItemResponse);

      // OPERATE
      const actualResponse = await projService.listProjects();

      // CHECK
      expect(actualResponse.data).toEqual(items);
    });
  });

  describe('getProject', () => {
    test('getting 1 project', async () => {
      // BUILD
      const getItemResponse: GetItemCommandOutput = {
        Item: marshall(projItem),
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

      // OPERATE
      const actualResponse = await projService.getProject('proj-123');

      // CHECK
      expect(actualResponse).toEqual(getItemResponse.Item);
    });
  });
});
