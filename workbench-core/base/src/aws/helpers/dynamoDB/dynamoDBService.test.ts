/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DynamoDBClient,
  QueryCommand,
  UpdateItemCommand,
  GetItemCommand,
  DeleteItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import JSONValue from '../../../types/json';
import { buildDynamoDBPkSk, MAX_GET_ITEMS_SIZE } from './ddbUtil';
import DynamoDBService from './dynamoDBService';

describe('DynamoDBService', () => {
  // Example iso date string 2022-05-16T21:29:23.461Z
  const isoStringRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

  const dbService = new DynamoDBService({ region: 'some-region', table: 'some-table' });

  describe('getItems', () => {
    test('fails when retrieving more than allowed', async () => {
      // BUILD
      const keys = Array.from({ length: MAX_GET_ITEMS_SIZE + 1 }, (v, k) => {
        return { pk: k, sk: k };
      });

      // CHECK
      await expect(dbService.getItems(keys)).rejects.toThrow(
        `Cannot retrieve more than ${MAX_GET_ITEMS_SIZE} items by request.`
      );
    });
  });

  describe('getItem', () => {
    let unmarshalledData: Record<string, JSONValue>;

    beforeEach(() => {
      unmarshalledData = {
        accountId: 'sampleAccId',
        awsAccountId: '123456789012',
        id: 'sampleAccId',
        portfolioId: 'port-1234',
        targetAccountStackName: 'swb-dev-va-hosting-account'
      };

      const mockDDB = mockClient(DynamoDBClient);

      mockDDB.on(GetItemCommand).resolves({
        Item: marshall(unmarshalledData)
      });
    });
    // Get Item
    test('returns unmarshalled item', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      // OPERATE
      const result = await dbService.getItem({ key });
      // CHECK
      expect(result).toEqual(unmarshalledData);
    });
  });

  describe('getPaginatedItems', () => {
    let unmarshalledData: Record<string, JSONValue>;
    let unmarshalledPaginationToken: { pk: string; sk: string };
    let base64EncodingOfPaginationToken = '';

    beforeEach(() => {
      unmarshalledData = {
        accountId: 'sampleAccId',
        awsAccountId: '123456789012',
        id: 'sampleAccId',
        portfolioId: 'port-1234',
        targetAccountStackName: 'swb-dev-va-hosting-account'
      };

      unmarshalledPaginationToken = {
        pk: 'pk',
        sk: 'sk'
      };
      base64EncodingOfPaginationToken = 'eyJwayI6InBrIiwic2siOiJzayJ9';

      const mockDDB = mockClient(DynamoDBClient);
      mockDDB.on(QueryCommand).resolves({
        Items: [marshall(unmarshalledData)],
        LastEvaluatedKey: marshall(unmarshalledPaginationToken)
      });
    });

    test('returns unmarshalled data', async () => {
      const result = await dbService.getPaginatedItems();
      expect(result.data).toEqual([unmarshalledData]);
      expect(result.paginationToken).toEqual(base64EncodingOfPaginationToken);
    });
  });

  describe('batchEdit', () => {
    test('should succeed with no optional params', async () => {
      // BUILD
      const expectedParams = {
        RequestItems: {
          'some-table': []
        }
      };

      // OPERATE
      const generatedParams = dbService.batchEdit().getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: addDeleteRequest', async () => {
      // BUILD
      const developerParams = { addDeleteRequest: { pk: 'samplePK', sk: 'sampleSK' } };
      const expectedParams = {
        RequestItems: {
          'some-table': [
            {
              DeleteRequest: {
                Key: {
                  pk: { S: 'samplePK' },
                  sk: { S: 'sampleSK' }
                }
              }
            }
          ]
        }
      };

      // OPERATE
      const generatedParams = dbService.batchEdit(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: addWriteRequest', async () => {
      // BUILD
      const developerParams = { addWriteRequest: { pk: 'samplePK', sk: 'sampleSK' } };
      const expectedParams = {
        RequestItems: {
          'some-table': [
            {
              PutRequest: {
                Item: {
                  pk: { S: 'samplePK' },
                  sk: { S: 'sampleSK' },
                  createdAt: { S: expect.stringMatching(isoStringRegex) },
                  updatedAt: { S: expect.stringMatching(isoStringRegex) }
                }
              }
            }
          ]
        }
      };

      // OPERATE
      const generatedParams = dbService.batchEdit(developerParams).getParams();

      // CHECK
      expect(generatedParams).toStrictEqual(expectedParams);
    });
    test('should populate params with optional param: addDeleteRequests', async () => {
      // BUILD
      const developerParams = {
        addDeleteRequests: [
          { pk: 'samplePK', sk: 'sampleSK' },
          { pk: 'samplePK2', sk: 'sampleSK2' }
        ]
      };
      const expectedParams = {
        RequestItems: {
          'some-table': [
            {
              DeleteRequest: {
                Key: {
                  pk: { S: 'samplePK' },
                  sk: { S: 'sampleSK' }
                }
              }
            },
            {
              DeleteRequest: {
                Key: {
                  pk: { S: 'samplePK2' },
                  sk: { S: 'sampleSK2' }
                }
              }
            }
          ]
        }
      };

      // OPERATE
      const generatedParams = dbService.batchEdit(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: addWriteRequests', async () => {
      // BUILD
      const developerParams = {
        addWriteRequests: [
          { pk: 'samplePK', sk: 'sampleSK' },
          { pk: 'samplePK2', sk: 'sampleSK2' }
        ]
      };
      const expectedParams = {
        RequestItems: {
          'some-table': [
            {
              PutRequest: {
                Item: {
                  pk: { S: 'samplePK' },
                  sk: { S: 'sampleSK' },
                  createdAt: { S: expect.stringMatching(isoStringRegex) },
                  updatedAt: { S: expect.stringMatching(isoStringRegex) }
                }
              }
            },
            {
              PutRequest: {
                Item: {
                  pk: { S: 'samplePK2' },
                  sk: { S: 'sampleSK2' },
                  createdAt: { S: expect.stringMatching(isoStringRegex) },
                  updatedAt: { S: expect.stringMatching(isoStringRegex) }
                }
              }
            }
          ]
        }
      };

      // OPERATE
      const generatedParams = dbService.batchEdit(developerParams).getParams();

      // CHECK
      expect(generatedParams).toStrictEqual(expectedParams);
    });
  });

  describe('deleteItem', () => {
    let unmarshalledAttributes: Record<string, JSONValue>;

    beforeEach(() => {
      unmarshalledAttributes = {
        accountId: 'sampleAccId',
        awsAccountId: '123456789012',
        id: 'sampleAccId',
        portfolioId: 'port-1234',
        targetAccountStackName: 'swb-dev-va-hosting-account'
      };

      const mockDDB = mockClient(DynamoDBClient);
      mockDDB.on(DeleteItemCommand).resolves({
        Attributes: marshall(unmarshalledAttributes)
      });
    });

    test('returns unmarshalled data', async () => {
      const result = await dbService.deleteItem({
        key: buildDynamoDBPkSk('sampleAccId', 'someType')
      });
      expect(result).toEqual(unmarshalledAttributes);
    });
  });

  describe('deleter', () => {
    test('should suceed with no optional params', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table'
      };

      // OPERATE
      const generatedParams = dbService.delete(key).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: condition', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { condition: 'attribute_exists(toDelete)' };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ConditionExpression: 'attribute_exists(toDelete)'
      };

      // OPERATE
      const generatedParams = dbService.delete(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: names', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { names: { '#P': 'Percentile' } };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ExpressionAttributeNames: { '#P': 'Percentile' }
      };

      // OPERATE
      const generatedParams = dbService.delete(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: values', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { values: { ':P': 'Percentile' } };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ExpressionAttributeValues: { ':P': { S: 'Percentile' } }
      };

      // OPERATE
      const generatedParams = dbService.delete(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: return = NONE', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { return: 'NONE' as const };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ReturnValues: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.delete(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: return = ALL_OLD', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { return: 'ALL_OLD' as const };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ReturnValues: 'ALL_OLD'
      };

      // OPERATE
      const generatedParams = dbService.delete(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = indexes', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { capacity: 'INDEXES' as const };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ReturnConsumedCapacity: 'INDEXES'
      };

      // OPERATE
      const generatedParams = dbService.delete(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = total', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { capacity: 'TOTAL' as const };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ReturnConsumedCapacity: 'TOTAL'
      };

      // OPERATE
      const generatedParams = dbService.delete(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = none', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { capacity: 'NONE' as const };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ReturnConsumedCapacity: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.delete(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: metrics = NONE', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { metrics: 'NONE' as const };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ReturnItemCollectionMetrics: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.delete(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: metrics = SIZE', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { metrics: 'SIZE' as const };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ReturnItemCollectionMetrics: 'SIZE'
      };

      // OPERATE
      const generatedParams = dbService.delete(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
  });

  describe('getItem', () => {
    let unmarshalledAttributes: Record<string, JSONValue>;

    beforeEach(() => {
      unmarshalledAttributes = {
        accountId: 'sampleAccId',
        awsAccountId: '123456789012',
        id: 'sampleAccId',
        portfolioId: 'port-1234',
        targetAccountStackName: 'swb-dev-va-hosting-account'
      };

      const mockDDB = mockClient(DynamoDBClient);
      mockDDB.on(GetItemCommand).resolves({
        Item: marshall(unmarshalledAttributes)
      });
    });

    test('returns unmarshalled data', async () => {
      const result = await dbService.getItem({
        key: buildDynamoDBPkSk('sampleAccId', 'someType')
      });
      expect(result).toEqual(unmarshalledAttributes);
    });
  });

  describe('getter', () => {
    // Get Item
    test('single get should populate params with no optional params', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table'
      };

      // OPERATE
      const generatedItemParams = dbService.get(key).getItemParams();
      const generatedBatchParams = dbService.get(key).getBatchParams();

      // CHECK
      expect(generatedItemParams).toEqual(expectedParams);
      expect(generatedBatchParams).toBeUndefined();
    });
    test('single get should populate params with optional param: strong = true', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { strong: true };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ConsistentRead: true
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedItemParams).toEqual(expectedParams);
      expect(generatedBatchParams).toBeUndefined();
    });
    test('single get should populate params with optional param: strong = false', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { strong: false };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table'
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedItemParams).toEqual(expectedParams);
      expect(generatedBatchParams).toBeUndefined();
    });
    test('single get should populate params with optional param: names', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { names: { '#P': 'Percentile' } };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ExpressionAttributeNames: { '#P': 'Percentile' }
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedItemParams).toEqual(expectedParams);
      expect(generatedBatchParams).toBeUndefined();
    });
    test('single get should populate params with optional param: projection', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { projection: 'status' };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ProjectionExpression: 'status'
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedItemParams).toEqual(expectedParams);
      expect(generatedBatchParams).toBeUndefined();
    });
    test('single get should populate params with optional param: projection list', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { projection: ['status', 'createdBy'] };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ExpressionAttributeNames: { '#createdBy': 'createdBy', '#status': 'status' },
        ProjectionExpression: '#status, #createdBy'
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedItemParams).toEqual(expectedParams);
      expect(generatedBatchParams).toBeUndefined();
    });
    test('single get should populate params with optional param: capacity = INDEXES', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { capacity: 'INDEXES' as const };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ReturnConsumedCapacity: 'INDEXES'
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedItemParams).toEqual(expectedParams);
      expect(generatedBatchParams).toBeUndefined();
    });
    test('single get should populate params with optional param: capacity = TOTAL', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { capacity: 'TOTAL' as const };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ReturnConsumedCapacity: 'TOTAL'
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedItemParams).toEqual(expectedParams);
      expect(generatedBatchParams).toBeUndefined();
    });
    test('single get should populate params with optional param: capacity = NONE', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { capacity: 'NONE' as const };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ReturnConsumedCapacity: 'NONE'
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedItemParams).toEqual(expectedParams);
      expect(generatedBatchParams).toBeUndefined();
    });
    test('single get should populate params with all optional params', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = {
        strong: true,
        names: { '#P': 'Percentile' },
        projection: ['status', 'createdBy'],
        capacity: 'NONE' as const
      };
      const expectedParams = {
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        TableName: 'some-table',
        ConsistentRead: true,
        ExpressionAttributeNames: { '#createdBy': 'createdBy', '#status': 'status', '#P': 'Percentile' },
        ProjectionExpression: '#status, #createdBy',
        ReturnConsumedCapacity: 'NONE'
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedItemParams).toEqual(expectedParams);
      expect(generatedBatchParams).toBeUndefined();
    });
    // Batch Get Item
    test('batch get should populate params with no optional params', async () => {
      // BUILD
      const key = [
        { pk: 'testId', sk: 'testId' },
        { pk: 'testId2', sk: 'testId2' }
      ];
      const expectedParams = {
        RequestItems: {
          'some-table': {
            Keys: [
              { pk: { S: 'testId' }, sk: { S: 'testId' } },
              { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
            ]
          }
        }
      };

      // OPERATE
      const generatedItemParams = dbService.get(key).getItemParams();
      const generatedBatchParams = dbService.get(key).getBatchParams();

      // CHECK
      expect(generatedBatchParams).toEqual(expectedParams);
      expect(generatedItemParams).toBeUndefined();
    });
    test('batch get should populate params with optional param: strong = true', async () => {
      // BUILD
      const key = [
        { pk: 'testId', sk: 'testId' },
        { pk: 'testId2', sk: 'testId2' }
      ];
      const developerParams = { strong: true };
      const expectedParams = {
        RequestItems: {
          'some-table': {
            ConsistentRead: true,
            Keys: [
              { pk: { S: 'testId' }, sk: { S: 'testId' } },
              { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
            ]
          }
        }
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedBatchParams).toEqual(expectedParams);
      expect(generatedItemParams).toBeUndefined();
    });
    test('batch get should populate params with optional param: strong = false', async () => {
      // BUILD
      const key = [
        { pk: 'testId', sk: 'testId' },
        { pk: 'testId2', sk: 'testId2' }
      ];
      const developerParams = { strong: false };
      const expectedParams = {
        RequestItems: {
          'some-table': {
            Keys: [
              { pk: { S: 'testId' }, sk: { S: 'testId' } },
              { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
            ]
          }
        }
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedBatchParams).toEqual(expectedParams);
      expect(generatedItemParams).toBeUndefined();
    });
    test('batch get should populate params with optional param: names', async () => {
      // BUILD
      const key = [
        { pk: 'testId', sk: 'testId' },
        { pk: 'testId2', sk: 'testId2' }
      ];
      const developerParams = { names: { '#P': 'Percentile' } };
      const expectedParams = {
        RequestItems: {
          'some-table': {
            Keys: [
              { pk: { S: 'testId' }, sk: { S: 'testId' } },
              { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
            ],
            ExpressionAttributeNames: { '#P': 'Percentile' }
          }
        }
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedBatchParams).toEqual(expectedParams);
      expect(generatedItemParams).toBeUndefined();
    });
    test('batch get should populate params with optional param: projection', async () => {
      // BUILD
      const key = [
        { pk: 'testId', sk: 'testId' },
        { pk: 'testId2', sk: 'testId2' }
      ];
      const developerParams = { projection: 'status' };
      const expectedParams = {
        RequestItems: {
          'some-table': {
            Keys: [
              { pk: { S: 'testId' }, sk: { S: 'testId' } },
              { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
            ],
            ProjectionExpression: 'status'
          }
        }
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedBatchParams).toEqual(expectedParams);
      expect(generatedItemParams).toBeUndefined();
    });
    test('batch get should populate params with optional param: projection list', async () => {
      // BUILD
      const key = [
        { pk: 'testId', sk: 'testId' },
        { pk: 'testId2', sk: 'testId2' }
      ];
      const developerParams = { projection: ['status', 'createdBy'] };
      const expectedParams = {
        RequestItems: {
          'some-table': {
            Keys: [
              { pk: { S: 'testId' }, sk: { S: 'testId' } },
              { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
            ],
            ExpressionAttributeNames: { '#createdBy': 'createdBy', '#status': 'status' },
            ProjectionExpression: '#status, #createdBy'
          }
        }
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedBatchParams).toEqual(expectedParams);
      expect(generatedItemParams).toBeUndefined();
    });
    test('batch get should populate params with optional param: capacity = INDEXES', async () => {
      // BUILD
      const key = [
        { pk: 'testId', sk: 'testId' },
        { pk: 'testId2', sk: 'testId2' }
      ];
      const developerParams = { capacity: 'INDEXES' as const };
      const expectedParams = {
        RequestItems: {
          'some-table': {
            Keys: [
              { pk: { S: 'testId' }, sk: { S: 'testId' } },
              { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
            ]
          }
        },
        ReturnConsumedCapacity: 'INDEXES'
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedBatchParams).toEqual(expectedParams);
      expect(generatedItemParams).toBeUndefined();
    });
    test('batch get should populate params with optional param: capacity = TOTAL', async () => {
      // BUILD
      const key = [
        { pk: 'testId', sk: 'testId' },
        { pk: 'testId2', sk: 'testId2' }
      ];
      const developerParams = { capacity: 'TOTAL' as const };
      const expectedParams = {
        RequestItems: {
          'some-table': {
            Keys: [
              { pk: { S: 'testId' }, sk: { S: 'testId' } },
              { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
            ]
          }
        },
        ReturnConsumedCapacity: 'TOTAL'
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedBatchParams).toEqual(expectedParams);
      expect(generatedItemParams).toBeUndefined();
    });
    test('batch get should populate params with optional param: capacity = NONE', async () => {
      // BUILD
      const key = [
        { pk: 'testId', sk: 'testId' },
        { pk: 'testId2', sk: 'testId2' }
      ];
      const developerParams = { capacity: 'NONE' as const };
      const expectedParams = {
        RequestItems: {
          'some-table': {
            Keys: [
              { pk: { S: 'testId' }, sk: { S: 'testId' } },
              { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
            ]
          }
        },
        ReturnConsumedCapacity: 'NONE'
      };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedBatchParams).toEqual(expectedParams);
      expect(generatedItemParams).toBeUndefined();
    });
  });
  describe('query', () => {
    test('should populate params with no optional params', async () => {
      // BUILD
      const expectedParams = {
        TableName: 'some-table'
      };

      // OPERATE
      const generatedParams = dbService.query().getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: index', async () => {
      // BUILD
      const developerParams = { index: 'some-index' };
      const expectedParams = {
        TableName: 'some-table',
        IndexName: 'some-index'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECL
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: key', async () => {
      // BUILD
      const developerParams = { key: { name: 'keyName', value: 'keyValue' } };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#keyName': 'keyName' },
        ExpressionAttributeValues: { ':keyName': { S: 'keyValue' } },
        KeyConditionExpression: '#keyName = :keyName'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: sort key and eq', async () => {
      // BUILD
      const developerParams = { sortKey: 'sortKey', eq: { S: 'sortKeyEqValue' } };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#sortKey': 'sortKey' },
        KeyConditionExpression: '#sortKey = :sortKey',
        ExpressionAttributeValues: { ':sortKey': { S: 'sortKeyEqValue' } }
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: sort key and lt', async () => {
      // BUILD
      const developerParams = { sortKey: 'sortKey', lt: { S: 'sortKeyLtValue' } };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#sortKey': 'sortKey' },
        KeyConditionExpression: '#sortKey < :sortKey',
        ExpressionAttributeValues: { ':sortKey': { S: 'sortKeyLtValue' } }
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: sort key and lte', async () => {
      // BUILD
      const developerParams = { sortKey: 'sortKey', lte: { S: 'sortKeyLteValue' } };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#sortKey': 'sortKey' },
        KeyConditionExpression: '#sortKey <= :sortKey',
        ExpressionAttributeValues: { ':sortKey': { S: 'sortKeyLteValue' } }
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: sort key and gt', async () => {
      // BUILD
      const developerParams = { sortKey: 'sortKey', gt: { S: 'sortKeyGtValue' } };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#sortKey': 'sortKey' },
        KeyConditionExpression: '#sortKey > :sortKey',
        ExpressionAttributeValues: { ':sortKey': { S: 'sortKeyGtValue' } }
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: sort key and gte', async () => {
      // BUILD
      const developerParams = { sortKey: 'sortKey', gte: { S: 'sortKeyGteValue' } };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#sortKey': 'sortKey' },
        KeyConditionExpression: '#sortKey >= :sortKey',
        ExpressionAttributeValues: { ':sortKey': { S: 'sortKeyGteValue' } }
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: sort key and between', async () => {
      // BUILD
      const developerParams = {
        sortKey: 'sortKey',
        between: { value1: { S: 'sortKeyBetweenValue1' }, value2: { S: 'sortKeyBetweenValue2' } }
      };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#sortKey': 'sortKey' },
        KeyConditionExpression: '#sortKey BETWEEN :sortKey1 AND :sortKey2',
        ExpressionAttributeValues: {
          ':sortKey1': { S: 'sortKeyBetweenValue1' },
          ':sortKey2': { S: 'sortKeyBetweenValue2' }
        }
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: sort key and begins', async () => {
      // BUILD
      const developerParams = { sortKey: 'sortKey', begins: { S: 'sortKeyBeginsValue' } };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#sortKey': 'sortKey' },
        KeyConditionExpression: 'begins_with ( #sortKey, :sortKey )',
        ExpressionAttributeValues: { ':sortKey': { S: 'sortKeyBeginsValue' } }
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: key and sort key and eq', async () => {
      // BUILD
      const developerParams = {
        key: { name: 'partitionKeyName', value: 'partitionKeyValue' },
        sortKey: 'sortKey',
        eq: { S: 'sortKeyEqValue' }
      };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#sortKey': 'sortKey', '#partitionKeyName': 'partitionKeyName' },
        KeyConditionExpression: '#partitionKeyName = :partitionKeyName AND #sortKey = :sortKey',
        ExpressionAttributeValues: {
          ':sortKey': { S: 'sortKeyEqValue' },
          ':partitionKeyName': { S: 'partitionKeyValue' }
        }
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should fail with optional param: eq without sort key', async () => {
      // BUILD
      const developerParams = { eq: { S: 'sortKeyEqValue' } };

      // OPERATE n CHECK
      expect(() => dbService.query(developerParams)).toThrow(
        'You cannot query on sortKey without providing a sortKey name'
      );
    });
    test('should fail with too many optional params on sortKey: eq and lt', async () => {
      // BUILD
      const developerParams = {
        sortKey: 'sortKey',
        eq: { S: 'sortKeyEqValue' },
        lt: { S: 'sortKeyltValue' }
      };

      // OPERATE n CHECK
      expect(() => dbService.query(developerParams)).toThrow(
        'You cannot query on two conditions seperately for sortKey'
      );
    });
    test('should populate params with optional param: start', async () => {
      // BUILD
      const developerParams = { start: { lastEvaluatedPk: 'pk', lastEvaluatedSk: 'sk' } };
      const expectedParams = {
        TableName: 'some-table',
        ExclusiveStartKey: { lastEvaluatedPk: { S: 'pk' }, lastEvaluatedSk: { S: 'sk' } }
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: filter', async () => {
      // BUILD
      const developerParams = { filter: 'attribute_not_exists(latest)' };
      const expectedParams = {
        TableName: 'some-table',
        FilterExpression: 'attribute_not_exists(latest)'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: strong = true', async () => {
      // BUILD
      const developerParams = { strong: true };
      const expectedParams = {
        TableName: 'some-table',
        ConsistentRead: true
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: strong = false', async () => {
      // BUILD
      const developerParams = { strong: false };
      const expectedParams = {
        TableName: 'some-table'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: names', async () => {
      // BUILD
      const developerParams = { names: { '#P': 'Percentile' } };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#P': 'Percentile' }
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: values', async () => {
      // BUILD
      const developerParams = { values: { ':P': 'Percentile' } };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeValues: { ':P': { S: 'Percentile' } }
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: projection', async () => {
      // BUILD
      const developerParams = { projection: 'status' };
      const expectedParams = {
        TableName: 'some-table',
        ProjectionExpression: 'status'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: projection list', async () => {
      // BUILD
      const developerParams = { projection: ['status', 'createdBy'] };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#createdBy': 'createdBy', '#status': 'status' },
        ProjectionExpression: '#status, #createdBy'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = ALL_ATTRIBUTES', async () => {
      // BUILD
      const developerParams = { select: 'ALL_ATTRIBUTES' as const };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'ALL_ATTRIBUTES'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = ALL_PROJECTED_ATTRIBUTES', async () => {
      // BUILD
      const developerParams = { select: 'ALL_PROJECTED_ATTRIBUTES' as const };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'ALL_PROJECTED_ATTRIBUTES'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = COUNT', async () => {
      // BUILD
      const developerParams = { select: 'COUNT' as const };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'COUNT'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = SPECIFIC_ATTRIBUTES', async () => {
      // BUILD
      const developerParams = { select: 'SPECIFIC_ATTRIBUTES' as const };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'SPECIFIC_ATTRIBUTES'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should fail with invalid optional params: projection but select != specific_attributes', async () => {
      // BUILD
      const developerParams = { projection: 'status', select: 'ALL_ATTRIBUTES' as const };

      // OPERATE n CHECK
      expect(() => dbService.query(developerParams)).toThrow(
        `You cannot select values except SPECIFIC_ATTRIBUTES when using projectionExpression`
      );
    });
    test('should populate params with optional param: limit', async () => {
      // BUILD
      const developerParams = { limit: 25 };
      const expectedParams = {
        TableName: 'some-table',
        Limit: 25
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: forward = true', async () => {
      // BUILD
      const developerParams = { forward: true };
      const expectedParams = {
        TableName: 'some-table',
        ScanIndexForward: true
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: forward = false', async () => {
      // BUILD
      const developerParams = { forward: false };
      const expectedParams = {
        TableName: 'some-table',
        ScanIndexForward: false
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = INDEXES', async () => {
      // BUILD
      const developerParams = { capacity: 'INDEXES' as const };
      const expectedParams = {
        TableName: 'some-table',
        ReturnConsumedCapacity: 'INDEXES'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = TOTAL', async () => {
      // BUILD
      const developerParams = { capacity: 'TOTAL' as const };
      const expectedParams = {
        TableName: 'some-table',
        ReturnConsumedCapacity: 'TOTAL'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = NONE', async () => {
      // BUILD
      const developerParams = { capacity: 'NONE' as const };
      const expectedParams = {
        TableName: 'some-table',
        ReturnConsumedCapacity: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
  });
  describe('scanner', () => {
    test('should succeed with no optional params', async () => {
      // BUILD
      const expectedParams = {
        TableName: 'some-table'
      };

      // OPERATE
      const generatedParams = dbService.scan().getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: index', async () => {
      // BUILD
      const developerParams = { index: 'some-index' };
      const expectedParams = {
        TableName: 'some-table',
        IndexName: 'some-index'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: start', async () => {
      // BUILD
      const developerParams = { start: { lastEvaluatedPk: 'pk', lastEvaluatedSk: 'sk' } };
      const expectedParams = {
        TableName: 'some-table',
        ExclusiveStartKey: { lastEvaluatedPk: { S: 'pk' }, lastEvaluatedSk: { S: 'sk' } }
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: filter', async () => {
      // BUILD
      const developerParams = { filter: 'attribute_not_exists(latest)' };
      const expectedParams = {
        TableName: 'some-table',
        FilterExpression: 'attribute_not_exists(latest)'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: strong = true', async () => {
      // BUILD
      const developerParams = { strong: true };
      const expectedParams = {
        TableName: 'some-table',
        ConsistentRead: true
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: strong = false', async () => {
      // BUILD
      const developerParams = { strong: false };
      const expectedParams = {
        TableName: 'some-table'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: names', async () => {
      // BUILD
      const developerParams = { names: { '#P': 'Percentile' } };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#P': 'Percentile' }
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: values', async () => {
      // BUILD
      const developerParams = { values: { ':P': 'Percentile' } };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeValues: { ':P': { S: 'Percentile' } }
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: projection', async () => {
      // BUILD
      const developerParams = { projection: 'status' };
      const expectedParams = {
        TableName: 'some-table',
        ProjectionExpression: 'status'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: projection list', async () => {
      // BUILD
      const developerParams = { projection: ['status', 'createdBy'] };
      const expectedParams = {
        TableName: 'some-table',
        ExpressionAttributeNames: { '#createdBy': 'createdBy', '#status': 'status' },
        ProjectionExpression: '#status, #createdBy'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = ALL_ATTRIBUTES', async () => {
      // BUILD
      const developerParams = { select: 'ALL_ATTRIBUTES' as const };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'ALL_ATTRIBUTES'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = ALL_PROJECTED_ATTRIBUTES', async () => {
      // BUILD
      const developerParams = { select: 'ALL_PROJECTED_ATTRIBUTES' as const };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'ALL_PROJECTED_ATTRIBUTES'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = COUNT', async () => {
      // BUILD
      const developerParams = { select: 'COUNT' as const };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'COUNT'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = SPECIFIC_ATTRIBUTES', async () => {
      // BUILD
      const developerParams = { select: 'SPECIFIC_ATTRIBUTES' as const };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'SPECIFIC_ATTRIBUTES'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: limit', async () => {
      // BUILD
      const developerParams = { limit: 25 };
      const expectedParams = {
        TableName: 'some-table',
        Limit: 25
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional params: totalSegment and segment', async () => {
      // BUILD
      const developerParams = { totalSegment: 4, segment: 0 };
      const expectedParams = {
        TableName: 'some-table',
        TotalSegments: 4,
        Segment: 0
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = INDEXES', async () => {
      // BUILD
      const developerParams = { capacity: 'INDEXES' as const };
      const expectedParams = {
        TableName: 'some-table',
        ReturnConsumedCapacity: 'INDEXES'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = TOTAL', async () => {
      // BUILD
      const developerParams = { capacity: 'TOTAL' as const };
      const expectedParams = {
        TableName: 'some-table',
        ReturnConsumedCapacity: 'TOTAL'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = NONE', async () => {
      // BUILD
      const developerParams = { capacity: 'NONE' as const };
      const expectedParams = {
        TableName: 'some-table',
        ReturnConsumedCapacity: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
  });

  describe('updateExecuteAndFormat', () => {
    let unmarshalledAttributes: Record<string, JSONValue>;

    beforeEach(() => {
      unmarshalledAttributes = {
        accountId: 'sampleAccId',
        awsAccountId: '123456789012',
        id: 'sampleAccId',
        portfolioId: 'port-1234',
        targetAccountStackName: 'swb-dev-va-hosting-account'
      };

      const mockDDB = mockClient(DynamoDBClient);
      mockDDB.on(UpdateItemCommand).resolves({
        Attributes: marshall(unmarshalledAttributes)
      });
    });

    test('returns unmarshalled data', async () => {
      const result = await dbService.updateExecuteAndFormat({
        key: buildDynamoDBPkSk('sampleAccId', 'someType')
      });
      expect(result).toEqual({ Attributes: unmarshalledAttributes });
    });
  });

  describe('updater', () => {
    test('should succeed with no optional params', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW'
      };

      // OPERATE
      const generatedParams = dbService.update({ key }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: item', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      // must include disableCreatedAt and disableUpdateAt as true so the tests pass
      const developerParams = {
        disableCreatedAt: true,
        disableUpdatedAt: true,
        item: { newAttribute: 'newValue' }
      };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ExpressionAttributeNames: { '#newAttribute': 'newAttribute' },
        ExpressionAttributeValues: {
          ':newAttribute': { S: 'newValue' }
        },
        UpdateExpression: 'SET #newAttribute = :newAttribute'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: set and names and values', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      // must include disableCreatedAt and disableUpdateAt as true so the tests pass
      const developerParams = {
        disableCreatedAt: true,
        disableUpdatedAt: true,
        set: '#newAttribute = :newValue',
        names: { '#newAttribute': 'newAttribute' },
        values: { ':newValue': 'newValue' }
      };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ExpressionAttributeNames: { '#newAttribute': 'newAttribute' },
        ExpressionAttributeValues: {
          ':newValue': { S: 'newValue' }
        },
        UpdateExpression: 'SET #newAttribute = :newValue'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: add and names and values', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      // must include disableCreatedAt and disableUpdateAt as true so the tests pass
      const developerParams = {
        disableCreatedAt: true,
        disableUpdatedAt: true,
        add: '#myNum :newValue',
        names: { '#myNum': 'myNum' },
        values: { ':newValue': 'newValue' }
      };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ExpressionAttributeNames: { '#myNum': 'myNum' },
        ExpressionAttributeValues: {
          ':newValue': { S: 'newValue' }
        },
        UpdateExpression: 'ADD #myNum :newValue'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: remove and names', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      // must include disableCreatedAt and disableUpdateAt as true so the tests pass
      const developerParams = {
        disableCreatedAt: true,
        disableUpdatedAt: true,
        remove: '#attributeToRemove',
        names: { '#attributeToRemove': 'attributeToRemove' }
      };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ExpressionAttributeNames: { '#attributeToRemove': 'attributeToRemove' },
        UpdateExpression: 'REMOVE #attributeToRemove'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: delete and names', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      // must include disableCreatedAt and disableUpdateAt as true so the tests pass
      const developerParams = {
        disableCreatedAt: true,
        disableUpdatedAt: true,
        delete: '#itemToDeleteFrom :itemToDelete',
        names: { '#itemToDeleteFrom': 'itemToDeleteFrom' },
        values: { ':itemToDelete': 'itemToDelete' }
      };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ExpressionAttributeNames: { '#itemToDeleteFrom': 'itemToDeleteFrom' },
        ExpressionAttributeValues: {
          ':itemToDelete': { S: 'itemToDelete' }
        },
        UpdateExpression: 'DELETE #itemToDeleteFrom :itemToDelete'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: return = NONE', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { return: 'NONE' as const };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: return = ALL_OLD', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { return: 'ALL_OLD' as const };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_OLD'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: return = UPDATED_OLD', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { return: 'UPDATED_OLD' as const };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'UPDATED_OLD'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: return = ALL_NEW', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { return: 'ALL_NEW' as const };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: return = UPDATED_NEW', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { return: 'UPDATED_NEW' as const };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'UPDATED_NEW'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: metrics = NONE', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { metrics: 'NONE' as const };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ReturnItemCollectionMetrics: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: metrics = SIZE', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { metrics: 'SIZE' as const };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ReturnItemCollectionMetrics: 'SIZE'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = INDEXES', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { capacity: 'INDEXES' as const };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ReturnConsumedCapacity: 'INDEXES'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = TOTAL', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { capacity: 'TOTAL' as const };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ReturnConsumedCapacity: 'TOTAL'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = NONE', async () => {
      // BUILD
      const key = { pk: 'samplePK', sk: 'sampleSK' };
      const developerParams = { capacity: 'NONE' as const };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ReturnConsumedCapacity: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.update({ key, params: developerParams }).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
  });
});
