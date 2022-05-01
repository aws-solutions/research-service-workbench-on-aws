/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import DynamoDBService from './dynamoDBService';

describe('DynamoDBService', () => {
  const dbService = new DynamoDBService({ region: 'some-region', table: 'some-table' });
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
      const developerParams = { addDeleteRequest: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } } };
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
      const developerParams = { addWriteRequest: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } } };
      const expectedParams = {
        RequestItems: {
          'some-table': [
            {
              PutRequest: {
                Item: {
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
    test('should populate params with optional param: addDeleteRequests', async () => {
      // BUILD
      const developerParams = {
        addDeleteRequests: [
          { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
          { pk: { S: 'samplePK2' }, sk: { S: 'sampleSK2' } }
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
          { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
          { pk: { S: 'samplePK2' }, sk: { S: 'sampleSK2' } }
        ]
      };
      const expectedParams = {
        RequestItems: {
          'some-table': [
            {
              PutRequest: {
                Item: {
                  pk: { S: 'samplePK' },
                  sk: { S: 'sampleSK' }
                }
              }
            },
            {
              PutRequest: {
                Item: {
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
  });
  describe('deleter', () => {
    test('should suceed with no optional params', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
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
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
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
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
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
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { values: { ':P': { S: 'Percentile' } } };
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
    test('should populate params with optional param: return = none', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { return: 'none' };
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
    test('should populate params with optional param: return = all_old', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { return: 'all_old' };
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
    test('should fail with optional param: return is invalid', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { return: 'some' };

      // OPERATE n CHECK
      expect(() => dbService.delete(key, developerParams)).toThrow(
        `"SOME" <== is not a valid value for DeleteItem ReturnValues. Only NONE,ALL_OLD are allowed.`
      );
    });
    test('should populate params with optional param: capacity = indexes', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { capacity: 'indexes' };
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
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { capacity: 'total' };
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
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { capacity: 'none' };
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
    test('should fail with optional param: capacity is invalid', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { capacity: 'some' };

      // OPERATE n CHECK
      expect(() => dbService.delete(key, developerParams)).toThrow(
        `"SOME" <== is not a valid value for ReturnConsumedCapacity. Only INDEXES,TOTAL,NONE are allowed.`
      );
    });
    test('should populate params with optional param: metrics = none', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { metrics: 'none' };
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
    test('should populate params with optional param: metrics = size', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { metrics: 'size' };
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
    test('should fail with optional param: metrics is invalid', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { metrics: 'lightyears' };

      // OPERATE n CHECK
      expect(() => dbService.delete(key, developerParams)).toThrow(
        `"LIGHTYEARS" <== is not a valid value for ReturnItemCollectionMetrics. Only NONE,SIZE are allowed.`
      );
    });
  });
  describe('getter', () => {
    // Get Item
    test('single get should populate params with no optional params', async () => {
      // BUILD
      const key = { pk: { S: 'testId' }, sk: { S: 'testId' } };
      const expectedParams = { Key: { pk: { S: 'testId' }, sk: { S: 'testId' } }, TableName: 'some-table' };

      // OPERATE
      const generatedItemParams = dbService.get(key).getItemParams();
      const generatedBatchParams = dbService.get(key).getBatchParams();

      // CHECK
      expect(generatedItemParams).toEqual(expectedParams);
      expect(generatedBatchParams).toBeUndefined();
    });
    test('single get should populate params with optional param: strong = true', async () => {
      // BUILD
      const key = { pk: { S: 'testId' }, sk: { S: 'testId' } };
      const developerParams = { strong: true };
      const expectedParams = {
        Key: { pk: { S: 'testId' }, sk: { S: 'testId' } },
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
      const key = { pk: { S: 'testId' }, sk: { S: 'testId' } };
      const developerParams = { strong: false };
      const expectedParams = { Key: { pk: { S: 'testId' }, sk: { S: 'testId' } }, TableName: 'some-table' };

      // OPERATE
      const generatedItemParams = dbService.get(key, developerParams).getItemParams();
      const generatedBatchParams = dbService.get(key, developerParams).getBatchParams();

      // CHECK
      expect(generatedItemParams).toEqual(expectedParams);
      expect(generatedBatchParams).toBeUndefined();
    });
    test('single get should populate params with optional param: names', async () => {
      // BUILD
      const key = { pk: { S: 'testId' }, sk: { S: 'testId' } };
      const developerParams = { names: { '#P': 'Percentile' } };
      const expectedParams = {
        Key: { pk: { S: 'testId' }, sk: { S: 'testId' } },
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
      const key = { pk: { S: 'testId' }, sk: { S: 'testId' } };
      const developerParams = { projection: 'status' };
      const expectedParams = {
        Key: { pk: { S: 'testId' }, sk: { S: 'testId' } },
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
      const key = { pk: { S: 'testId' }, sk: { S: 'testId' } };
      const developerParams = { projection: ['status', 'createdBy'] };
      const expectedParams = {
        Key: { pk: { S: 'testId' }, sk: { S: 'testId' } },
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
    test('single get should populate params with optional param: capacity = indexes', async () => {
      // BUILD
      const key = { pk: { S: 'testId' }, sk: { S: 'testId' } };
      const developerParams = { capacity: 'indexes' };
      const expectedParams = {
        Key: { pk: { S: 'testId' }, sk: { S: 'testId' } },
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
    test('single get should populate params with optional param: capacity = total', async () => {
      // BUILD
      const key = { pk: { S: 'testId' }, sk: { S: 'testId' } };
      const developerParams = { capacity: 'total' };
      const expectedParams = {
        Key: { pk: { S: 'testId' }, sk: { S: 'testId' } },
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
    test('single get should populate params with optional param: capacity = none', async () => {
      // BUILD
      const key = { pk: { S: 'testId' }, sk: { S: 'testId' } };
      const developerParams = { capacity: 'none' };
      const expectedParams = {
        Key: { pk: { S: 'testId' }, sk: { S: 'testId' } },
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
    test('single get should fail with optional param: capacity is invalid', async () => {
      // BUILD
      const key = { pk: { S: 'testId' }, sk: { S: 'testId' } };
      const developerParams = { capacity: 'some' };

      // OPERATE n CHECK
      expect(() => dbService.get(key, developerParams)).toThrow(
        `"SOME" <== is not a valid value for ReturnConsumedCapacity. Only INDEXES,TOTAL,NONE are allowed.`
      );
    });
    test('single get should populate params with all optional params', async () => {
      // BUILD
      const key = { pk: { S: 'testId' }, sk: { S: 'testId' } };
      const developerParams = {
        strong: true,
        names: { '#P': 'Percentile' },
        projection: ['status', 'createdBy'],
        capacity: 'none'
      };
      const expectedParams = {
        Key: { pk: { S: 'testId' }, sk: { S: 'testId' } },
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
        { pk: { S: 'testId' }, sk: { S: 'testId' } },
        { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
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
        { pk: { S: 'testId' }, sk: { S: 'testId' } },
        { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
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
        { pk: { S: 'testId' }, sk: { S: 'testId' } },
        { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
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
        { pk: { S: 'testId' }, sk: { S: 'testId' } },
        { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
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
        { pk: { S: 'testId' }, sk: { S: 'testId' } },
        { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
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
        { pk: { S: 'testId' }, sk: { S: 'testId' } },
        { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
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
    test('batch get should populate params with optional param: capacity = indexes', async () => {
      // BUILD
      const key = [
        { pk: { S: 'testId' }, sk: { S: 'testId' } },
        { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
      ];
      const developerParams = { capacity: 'indexes' };
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
    test('batch get should populate params with optional param: capacity = total', async () => {
      // BUILD
      const key = [
        { pk: { S: 'testId' }, sk: { S: 'testId' } },
        { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
      ];
      const developerParams = { capacity: 'total' };
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
    test('batch get should populate params with optional param: capacity = none', async () => {
      // BUILD
      const key = [
        { pk: { S: 'testId' }, sk: { S: 'testId' } },
        { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
      ];
      const developerParams = { capacity: 'none' };
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
    test('batch get should fail with optional param: capacity is invalid', async () => {
      // BUILD
      const key = [
        { pk: { S: 'testId' }, sk: { S: 'testId' } },
        { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
      ];
      const developerParams = { capacity: 'some' };

      // OPERATE

      // CHECK
      expect(() => dbService.get(key, developerParams)).toThrow(
        `"SOME" <== is not a valid value for ReturnConsumedCapacity. Only INDEXES,TOTAL,NONE are allowed.`
      );
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
      const developerParams = { key: { name: 'keyName', value: { S: 'keyValue' } } };
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
        key: { name: 'partitionKeyName', value: { S: 'partitionKeyValue' } },
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
      const developerParams = { start: { lastEvaluatedPk: { S: 'pk' }, lastEvaluatedSk: { S: 'sk' } } };
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
      const developerParams = { values: { ':P': { S: 'Percentile' } } };
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
    test('should populate params with optional param: select = all_attributes', async () => {
      // BUILD
      const developerParams = { select: 'all_attributes' };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'ALL_ATTRIBUTES'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = all_projected_attributes', async () => {
      // BUILD
      const developerParams = { select: 'all_projected_attributes' };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'ALL_PROJECTED_ATTRIBUTES'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = count', async () => {
      // BUILD
      const developerParams = { select: 'count' };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'COUNT'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = specific_attributes', async () => {
      // BUILD
      const developerParams = { select: 'specific_attributes' };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'SPECIFIC_ATTRIBUTES'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should fail with optional param: invalid select options', async () => {
      // BUILD
      const developerParams = { select: 'some' };

      // OPERATE n CHECK
      expect(() => dbService.query(developerParams)).toThrow(
        `"SOME" <== is not a valid value for Select. Only ALL_ATTRIBUTES,ALL_PROJECTED_ATTRIBUTES,SPECIFIC_ATTRIBUTES,COUNT are allowed.`
      );
    });
    test('should fail with invalid optional params: projection but select != specific_attributes', async () => {
      // BUILD
      const developerParams = { projection: 'status', select: 'all_attributes' };

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
    test('should populate params with optional param: capacity = indexes', async () => {
      // BUILD
      const developerParams = { capacity: 'indexes' };
      const expectedParams = {
        TableName: 'some-table',
        ReturnConsumedCapacity: 'INDEXES'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = total', async () => {
      // BUILD
      const developerParams = { capacity: 'total' };
      const expectedParams = {
        TableName: 'some-table',
        ReturnConsumedCapacity: 'TOTAL'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = none', async () => {
      // BUILD
      const developerParams = { capacity: 'none' };
      const expectedParams = {
        TableName: 'some-table',
        ReturnConsumedCapacity: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.query(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should fail with optional param: capacity is invalid', async () => {
      // BUILD
      const developerParams = { capacity: 'some' };

      // OPERATE n CHECK
      expect(() => dbService.query(developerParams)).toThrow(
        `"SOME" <== is not a valid value for ReturnConsumedCapacity. Only INDEXES,TOTAL,NONE are allowed.`
      );
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
      const developerParams = { start: { lastEvaluatedPk: { S: 'pk' }, lastEvaluatedSk: { S: 'sk' } } };
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
      const developerParams = { values: { ':P': { S: 'Percentile' } } };
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
    test('should populate params with optional param: select = all_attributes', async () => {
      // BUILD
      const developerParams = { select: 'all_attributes' };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'ALL_ATTRIBUTES'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = all_projected_attributes', async () => {
      // BUILD
      const developerParams = { select: 'all_projected_attributes' };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'ALL_PROJECTED_ATTRIBUTES'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = count', async () => {
      // BUILD
      const developerParams = { select: 'count' };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'COUNT'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: select = specific_attributes', async () => {
      // BUILD
      const developerParams = { select: 'specific_attributes' };
      const expectedParams = {
        TableName: 'some-table',
        Select: 'SPECIFIC_ATTRIBUTES'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should fail with optional param: invalid select options', async () => {
      // BUILD
      const developerParams = { select: 'some' };

      // OPERATE n CHECK
      expect(() => dbService.scan(developerParams)).toThrow(
        `"SOME" <== is not a valid value for Select. Only ALL_ATTRIBUTES,ALL_PROJECTED_ATTRIBUTES,SPECIFIC_ATTRIBUTES,COUNT are allowed.`
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
    test('should populate params with optional param: capacity = indexes', async () => {
      // BUILD
      const developerParams = { capacity: 'indexes' };
      const expectedParams = {
        TableName: 'some-table',
        ReturnConsumedCapacity: 'INDEXES'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = total', async () => {
      // BUILD
      const developerParams = { capacity: 'total' };
      const expectedParams = {
        TableName: 'some-table',
        ReturnConsumedCapacity: 'TOTAL'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = none', async () => {
      // BUILD
      const developerParams = { capacity: 'none' };
      const expectedParams = {
        TableName: 'some-table',
        ReturnConsumedCapacity: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.scan(developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should fail with optional param: capacity is invalid', async () => {
      // BUILD
      const developerParams = { capacity: 'some' };

      // OPERATE n CHECK
      expect(() => dbService.scan(developerParams)).toThrow(
        `"SOME" <== is not a valid value for ReturnConsumedCapacity. Only INDEXES,TOTAL,NONE are allowed.`
      );
    });
  });
  describe('updater', () => {
    test('should succeed with no optional params', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW'
      };

      // OPERATE
      const generatedParams = dbService.update(key).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: item', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      // must include disableCreatedAt and disableUpdateAt as true so the tests pass
      const developerParams = {
        disableCreatedAt: true,
        disableUpdatedAt: true,
        item: { newAttribute: { S: 'newValue' } }
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
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: set and names and values', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      // must include disableCreatedAt and disableUpdateAt as true so the tests pass
      const developerParams = {
        disableCreatedAt: true,
        disableUpdatedAt: true,
        set: '#newAttribute = :newValue',
        names: { '#newAttribute': 'newAttribute' },
        values: { ':newValue': { S: 'newValue' } }
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
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: add and names and values', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      // must include disableCreatedAt and disableUpdateAt as true so the tests pass
      const developerParams = {
        disableCreatedAt: true,
        disableUpdatedAt: true,
        add: '#myNum :newValue',
        names: { '#myNum': 'myNum' },
        values: { ':newValue': { S: 'newValue' } }
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
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: remove and names', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
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
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: delete and names', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      // must include disableCreatedAt and disableUpdateAt as true so the tests pass
      const developerParams = {
        disableCreatedAt: true,
        disableUpdatedAt: true,
        delete: '#itemToDeleteFrom :itemToDelete',
        names: { '#itemToDeleteFrom': 'itemToDeleteFrom' },
        values: { ':itemToDelete': { S: 'itemToDelete' } }
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
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: return = none', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { return: 'none' };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: return = all_old', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { return: 'all_old' };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_OLD'
      };

      // OPERATE
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: return = updated_old', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { return: 'updated_old' };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'UPDATED_OLD'
      };

      // OPERATE
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: return = all_new', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { return: 'all_new' };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW'
      };

      // OPERATE
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: return = updated_new', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { return: 'updated_new' };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'UPDATED_NEW'
      };

      // OPERATE
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should fail with optional param: return is invalid', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { return: 'some' };

      // OPERATE n CHECK
      expect(() => dbService.update(key, developerParams)).toThrow(
        `"SOME" <== is not a valid value for ReturnValues. Only NONE,ALL_OLD,UPDATED_OLD,ALL_NEW,UPDATED_NEW are allowed.`
      );
    });
    test('should populate params with optional param: metrics = none', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { metrics: 'none' };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ReturnItemCollectionMetrics: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: metrics = size', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { metrics: 'size' };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ReturnItemCollectionMetrics: 'SIZE'
      };

      // OPERATE
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should fail with optional param: metrics is invalid', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { metrics: 'lightyears' };

      // OPERATE n CHECK
      expect(() => dbService.update(key, developerParams)).toThrow(
        `"LIGHTYEARS" <== is not a valid value for ReturnItemCollectionMetrics. Only NONE,SIZE are allowed.`
      );
    });
    test('should populate params with optional param: capacity = indexes', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { capacity: 'indexes' };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ReturnConsumedCapacity: 'INDEXES'
      };

      // OPERATE
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = total', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { capacity: 'total' };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ReturnConsumedCapacity: 'TOTAL'
      };

      // OPERATE
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should populate params with optional param: capacity = none', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { capacity: 'none' };
      const expectedParams = {
        TableName: 'some-table',
        Key: { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } },
        ReturnValues: 'ALL_NEW',
        ReturnConsumedCapacity: 'NONE'
      };

      // OPERATE
      const generatedParams = dbService.update(key, developerParams).getParams();

      // CHECK
      expect(generatedParams).toEqual(expectedParams);
    });
    test('should fail zwith optional param: capacity is invalid', async () => {
      // BUILD
      const key = { pk: { S: 'samplePK' }, sk: { S: 'sampleSK' } };
      const developerParams = { capacity: 'some' };

      // OPERATE n CHECK
      expect(() => dbService.update(key, developerParams)).toThrow(
        `"SOME" <== is not a valid value for ReturnConsumedCapacity. Only INDEXES,TOTAL,NONE are allowed.`
      );
    });
  });
});
