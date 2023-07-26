/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Query from './query';

// The tests in this file test for scenarios that are not possible is you use the dynamoDBService to initialize/use query

describe('query', () => {
  test('should succeed in manually changing the table to single get from', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');
    const expectedParams = {
      TableName: 'actuallyQueryThisTable'
    };

    // OPERATE
    const generatedParams = query.table('actuallyQueryThisTable').getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should fail if table name is empty string', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => query.table('')).toThrow(`TableName must be a string and can not be empty.`);
  });
  test('should fail if index name is empty string', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => query.index('')).toThrow(`IndexName must be a string and can not be empty.`);
  });
  test('should fail if key is empty string', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => query.key('', { S: '' })).toThrow(`Key name must be a string and can not be empty.`);
  });
  test('should fail if you call .eq() before .sortKey()', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => query.eq({ S: 'eq' })).toThrow(
      'You tried to call Query.eq(), however, you must call Query.sortKey() first.'
    );
  });
  test('should fail if you call .lt() before .sortKey()', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => query.lt({ S: 'lt' })).toThrow(
      'You tried to call Query.lt(), however, you must call Query.sortKey() first.'
    );
  });
  test('should fail if you call .lte() before .sortKey()', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => query.lte({ S: 'lte' })).toThrow(
      'You tried to call Query.lte(), however, you must call Query.sortKey() first.'
    );
  });
  test('should fail if you call .gt() before .sortKey()', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => query.gt({ S: 'gt' })).toThrow(
      'You tried to call Query.gt(), however, you must call Query.sortKey() first.'
    );
  });
  test('should fail if you call .gte() before .sortKey()', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => query.gte({ S: 'gte' })).toThrow(
      'You tried to call Query.gte(), however, you must call Query.sortKey() first.'
    );
  });
  test('should fail if you call .between() before .sortKey()', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => query.between({ S: 'betweenq' }, { S: 'between2' })).toThrow(
      'You tried to call Query.between(), however, you must call Query.sortKey() first.'
    );
  });
  test('should fail if you call .begins() before .sortKey()', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => query.begins({ S: 'begins' })).toThrow(
      'You tried to call Query.begins(), however, you must call Query.sortKey() first.'
    );
  });
  test('should delete ExclusiveStartKey from params if passed value is undefined', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');
    const expectedParams = {
      TableName: 'sample-table'
    };

    // OPERATE
    const generatedParams = query.start(undefined).getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('add two filters expressions to request', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');
    const expectedParams = {
      TableName: 'sample-table',
      FilterExpression: 'attribute_not_exists(atr1) attribute_exists(atr2)'
    };

    // OPERATE
    const generatedParams = query
      .filter('attribute_not_exists(atr1)')
      .filter('attribute_exists(atr2)')
      .getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('add two single projection expressions to request', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');
    const expectedParams = {
      TableName: 'sample-table',
      ProjectionExpression: 'attr1, attr2'
    };

    // OPERATE
    const generatedParams = query.projection('attr1').projection('attr2').getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('add a single and a list projection expressions to single get request', async () => {
    // BUILD
    const query = new Query({ region: 'us-east-1' }, 'sample-table');
    const expectedParams = {
      TableName: 'sample-table',
      ExpressionAttributeNames: {
        '#attr2': 'attr2',
        '#attr22': 'attr22'
      },
      ProjectionExpression: 'attr1, #attr2, #attr22'
    };

    // OPERATE
    const generatedParams = query.projection('attr1').projection(['attr2', 'attr22']).getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
});
