/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Scanner from './scanner';

// The tests in this file test for scenarios that are not possible is you use the dynamoDBService to initialize/use scanner

describe('scanner', () => {
  test('should succeed in manually changing the table to single get from', async () => {
    // BUILD
    const scanner = new Scanner({ region: 'us-east-1' }, 'sample-table');
    const expectedParams = {
      TableName: 'actuallyScanThisTable'
    };

    // OPERATE
    const generatedParams = scanner.table('actuallyScanThisTable').getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should fail if table name is empty string', async () => {
    // BUILD
    const scanner = new Scanner({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => scanner.table('')).toThrow(`TableName must be a string and can not be empty.`);
  });
  test('should fail if index name is empty string', async () => {
    // BUILD
    const scanner = new Scanner({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => scanner.index('')).toThrow(`IndexName must be a string and can not be empty.`);
  });
  test('add two filters expressions to request', async () => {
    // BUILD
    const scanner = new Scanner({ region: 'us-east-1' }, 'sample-table');
    const expectedParams = {
      TableName: 'sample-table',
      FilterExpression: 'attribute_not_exists(atr1) attribute_exists(atr2)'
    };

    // OPERATE
    const generatedParams = scanner
      .filter('attribute_not_exists(atr1)')
      .filter('attribute_exists(atr2)')
      .getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('add two single projection expressions to request', async () => {
    // BUILD
    const scanner = new Scanner({ region: 'us-east-1' }, 'sample-table');
    const expectedParams = {
      TableName: 'sample-table',
      ProjectionExpression: 'attr1, attr2'
    };

    // OPERATE
    const generatedParams = scanner.projection('attr1').projection('attr2').getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('add a single and a list projection expressions to single get request', async () => {
    // BUILD
    const scanner = new Scanner({ region: 'us-east-1' }, 'sample-table');
    const expectedParams = {
      TableName: 'sample-table',
      ExpressionAttributeNames: {
        '#attr2': 'attr2',
        '#attr22': 'attr22'
      },
      ProjectionExpression: 'attr1, #attr2, #attr22'
    };

    // OPERATE
    const generatedParams = scanner.projection('attr1').projection(['attr2', 'attr22']).getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should fail providing segment but not totalegments', async () => {
    // BUILD
    const scanner = new Scanner({ region: 'us-east-1' }, 'sample-table');

    // OPERATE n CHECK
    expect(() => scanner.segment(0)).toThrow(
      'Cannot provide segment without totalSegment. Call .totalSegment() before .segment()'
    );
  });
});
