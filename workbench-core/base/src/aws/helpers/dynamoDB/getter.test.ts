/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Getter from './getter';

// The tests in this file test for scenarios that are not possible is you use the dynamoDBService to initialize/use getter

describe('getter', () => {
  test('should fail if you try to change table name on a batch get request', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', [
      { pk: 'testId', sk: 'testId' },
      { pk: 'testId2', sk: 'testId2' }
    ]);

    // OPERATE n CHECK
    expect(() => getter.table('differentTable')).toThrow(
      'Cannot change the table of batch get request after initialization. Start over.'
    );
  });
  test('should fail if table name is empty string for single get request', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', { pk: 'pk' });

    // OPERATE n CHECK
    expect(() => getter.table('')).toThrow(`TableName must be a string and can not be empty.`);
  });
  test('should succeed in manually changing the table to single get from', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', { pk: 'pk' });
    const expectedParams = {
      Key: { pk: { S: 'pk' } },
      TableName: 'actuallyGetFromFromThisTable'
    };

    // OPERATE
    const generatedParams = getter.table('actuallyGetFromFromThisTable').getItemParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should fail if you call .key() on a batch get request', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', [
      { pk: 'testId', sk: 'testId' },
      { pk: 'testId2', sk: 'testId2' }
    ]);

    // OPERATE n CHECK
    expect(() => getter.key({ pk: { S: 'pk' } })).toThrow('Cannot use .key() on a batch get request.');
  });
  test('should succeed in manually changing the key to get in single get request', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', { pk: 'pk' });
    const expectedParams = {
      Key: { pk: { S: 'actuallyGetThisKey' } },
      TableName: 'sample-table'
    };

    // OPERATE
    const generatedParams = getter.key({ pk: 'actuallyGetThisKey' }).getItemParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should succeed in manually changing the key to get if the key has been made undefined beforehand', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', { pk: 'pk' });
    const expectedParams = {
      Key: { pk: { S: 'actuallyGetThisKey' } },
      TableName: 'sample-table'
    };

    // OPERATE
    expect(getter.getItemParams()).toBeDefined();
    const params = getter.getItemParams();
    if (params) {
      params.Key = undefined;
    }
    const generatedParams = getter.key({ pk: 'actuallyGetThisKey' }).getItemParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should fail if you call .keys() on a single get request', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', { pk: 'pk' });

    // OPERATE n CHECK
    expect(() =>
      getter.keys([
        { pk: { S: 'testId' }, sk: { S: 'testId' } },
        { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
      ])
    ).toThrow('Cannot use .keys() on a single get request.');
  });
  test('should succeed in manually changing the keys to get in batch get request', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', [
      { pk: 'testId', sk: 'testId' },
      { pk: 'testId2', sk: 'testId2' }
    ]);
    const expectedParams = {
      RequestItems: {
        'sample-table': {
          Keys: [
            { pk: { S: 'testIdNew' }, sk: { S: 'testIdNew' } },
            { pk: { S: 'testId2New' }, sk: { S: 'testId2New' } }
          ]
        }
      }
    };

    // OPERATE
    const generatedParams = getter
      .keys([
        { pk: { S: 'testIdNew' }, sk: { S: 'testIdNew' } },
        { pk: { S: 'testId2New' }, sk: { S: 'testId2New' } }
      ])
      .getBatchParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('add two single projection expressions to single get request', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', { pk: 'pk' });
    const expectedParams = {
      Key: { pk: { S: 'pk' } },
      TableName: 'sample-table',
      ProjectionExpression: 'attr1, attr2'
    };

    // OPERATE
    const generatedParams = getter.projection('attr1').projection('attr2').getItemParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('add a single and a list projection expressions to single get request', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', { pk: 'pk' });
    const expectedParams = {
      Key: { pk: { S: 'pk' } },
      TableName: 'sample-table',
      ExpressionAttributeNames: {
        '#attr2': 'attr2',
        '#attr22': 'attr22'
      },
      ProjectionExpression: 'attr1, #attr2, #attr22'
    };

    // OPERATE
    const generatedParams = getter.projection('attr1').projection(['attr2', 'attr22']).getItemParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('add two single projection expressions to batch get request', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', [
      { pk: 'testId', sk: 'testId' },
      { pk: 'testId2', sk: 'testId2' }
    ]);
    const expectedParams = {
      RequestItems: {
        'sample-table': {
          Keys: [
            { pk: { S: 'testId' }, sk: { S: 'testId' } },
            { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
          ],
          ProjectionExpression: 'attr1, attr2'
        }
      }
    };

    // OPERATE
    const generatedParams = getter.projection('attr1').projection('attr2').getBatchParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('add a single and a list projection expressions to batch get request', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', [
      { pk: 'testId', sk: 'testId' },
      { pk: 'testId2', sk: 'testId2' }
    ]);
    const expectedParams = {
      RequestItems: {
        'sample-table': {
          Keys: [
            { pk: { S: 'testId' }, sk: { S: 'testId' } },
            { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
          ],
          ExpressionAttributeNames: {
            '#attr2': 'attr2',
            '#attr22': 'attr22'
          },
          ProjectionExpression: 'attr1, #attr2, #attr22'
        }
      }
    };

    // OPERATE
    const generatedParams = getter.projection('attr1').projection(['attr2', 'attr22']).getBatchParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should set consistent read when strong() is called with batch get', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', [
      { pk: 'testId', sk: 'testId' },
      { pk: 'testId2', sk: 'testId2' }
    ]);
    const expectedParams = {
      RequestItems: {
        'sample-table': {
          Keys: [
            { pk: { S: 'testId' }, sk: { S: 'testId' } },
            { pk: { S: 'testId2' }, sk: { S: 'testId2' } }
          ],
          ConsistentRead: true
        }
      }
    };

    // OPERATE
    const generatedParams = getter.strong().getBatchParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should set consistent read when strong() is called with get', async () => {
    // BUILD
    const getter = new Getter({ region: 'us-east-1' }, 'sample-table', { pk: 'testId', sk: 'testId' });
    const expectedParams = {
      Key: { pk: { S: 'testId' }, sk: { S: 'testId' } },
      ConsistentRead: true,
      TableName: 'sample-table'
    };

    // OPERATE
    const generatedParams = getter.strong().getItemParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
});
