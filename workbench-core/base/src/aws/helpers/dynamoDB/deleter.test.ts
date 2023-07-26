/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Deleter from './deleter';

// The tests in this file test for scenarios that are not possible is you use the dynamoDBService to initialize/use deleter

describe('deleter', () => {
  test('should fail if table name is empty', async () => {
    // BUILD
    const deleter = new Deleter({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });

    // OPERATE n CHECK
    expect(() => deleter.table('')).toThrow(`TableName must be a string and can not be empty.`);
  });
  test('should succeed in manually changing the table to delete from', async () => {
    // BUILD
    const deleter = new Deleter({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });
    const expectedParams = {
      Key: { pk: { S: 'pk' } },
      TableName: 'actuallyDeleteFromThisTable'
    };

    // OPERATE
    const generatedParams = deleter.table('actuallyDeleteFromThisTable').getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should succeed in manually changing the key to delete', async () => {
    // BUILD
    const deleter = new Deleter({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });
    const expectedParams = {
      Key: { pk: { S: 'actuallyDeleteThisKey' } },
      TableName: 'sample-table'
    };

    // OPERATE
    const generatedParams = deleter.key({ pk: { S: 'actuallyDeleteThisKey' } }).getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should succeed in manually changing the key to delete if the key has been made undefined beforehand', async () => {
    // BUILD
    const deleter = new Deleter({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });
    const expectedParams = {
      Key: { pk: { S: 'actuallyDeleteThisKey' } },
      TableName: 'sample-table'
    };

    // OPERATE
    deleter.getParams().Key = undefined;
    const generatedParams = deleter.key({ pk: { S: 'actuallyDeleteThisKey' } }).getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should fail if you call condition twice (ie try to set two conditions', async () => {
    // BUILD
    const deleter = new Deleter({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });

    // OPERATE n CHECK
    expect(() => deleter.condition('first condition').condition('second condition')).toThrow(
      `You already called condition() before .condition(second condition). Cannot set two conditions.`
    );
  });
});
