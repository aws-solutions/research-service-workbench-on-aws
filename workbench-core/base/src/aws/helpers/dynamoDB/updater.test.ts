/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Updater from './updater';

// The tests in this file test for scenarios that are not possible is you use the dynamoDBService to initialize/use scanner

describe('updater', () => {
  test('should succeed in manually changing the table to update', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });
    const expectedParams = {
      Key: { pk: { S: 'pk' } },
      TableName: 'actuallyUpdateThisTable',
      ReturnValues: 'ALL_NEW'
    };

    // OPERATE
    const generatedParams = updater.table('actuallyUpdateThisTable').getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should fail if table name is empty string', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });

    // OPERATE n CHECK
    expect(() => updater.table('')).toThrow(`TableName must be a string and can not be empty.`);
  });
  test('.mark() should fail if command has already been executed', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });

    // OPERATE
    updater.getParams().UpdateExpression = 'some past update expression';

    // OPERATE n CHECK
    expect(() => updater.mark([])).toThrow(
      'You tried to call Updater.mark() after you called Updater.execute(). Call mark() before calling execute().'
    );
  });
  test('should succeed in manually changing the key to get in request', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });
    const expectedParams = {
      Key: { pk: { S: 'actuallyUpdateThisKey' } },
      TableName: 'sample-table',
      ReturnValues: 'ALL_NEW'
    };

    // OPERATE
    const generatedParams = updater.key({ pk: { S: 'actuallyUpdateThisKey' } }).getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('should succeed in manually changing the key to update if the key has been made undefined beforehand', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });
    const expectedParams = {
      Key: { pk: { S: 'actuallyUpdateThisKey' } },
      TableName: 'sample-table',
      ReturnValues: 'ALL_NEW'
    };

    // OPERATE
    updater.getParams().Key = undefined;
    const generatedParams = updater.key({ pk: { S: 'actuallyUpdateThisKey' } }).getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('.key() should fail if command has already been executed', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });

    // OPERATE
    updater.getParams().UpdateExpression = 'some past update expression';

    // OPERATE n CHECK
    expect(() => updater.key({})).toThrow(
      'You tried to call Updater.key() after you called Updater.execute(). Call key() before calling execute().'
    );
  });
  test('.disableCreatedAt() should fail if command has already been executed', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });

    // OPERATE
    updater.getParams().UpdateExpression = 'some past update expression';

    // OPERATE n CHECK
    expect(() => updater.disableCreatedAt()).toThrow(
      'You tried to call Updater.disableCreatedAt() after you called Updater.execute(). Call disableCreatedAt() before calling execute().'
    );
  });
  test('.createdAt() should fail if command has already been executed', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });

    // OPERATE
    updater.getParams().UpdateExpression = 'some past update expression';

    // OPERATE n CHECK
    expect(() => updater.createdAt('')).toThrow(
      'You tried to call Updater.createdAt() after you called Updater.execute(). Call createdAt() before calling execute().'
    );
  });
  test('should fail if createdAt string is empty string', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });

    // OPERATE n CHECK
    expect(() => updater.createdAt('')).toThrow(
      `"" <== must be a string or Date and can not be empty to assign to createdAt attribute.`
    );
  });
  test('.disableUpdatedAt() should fail if command has already been executed', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });

    // OPERATE
    updater.getParams().UpdateExpression = 'some past update expression';

    // OPERATE n CHECK
    expect(() => updater.disableUpdatedAt()).toThrow(
      'You tried to call Updater.disableUpdatedAt() after you called Updater.execute(). Call disableUpdatedAt() before calling execute().'
    );
  });
  test('.udpatedAt() should fail if command has already been executed', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });

    // OPERATE
    updater.getParams().UpdateExpression = 'some past update expression';

    // OPERATE n CHECK
    expect(() => updater.updatedAt('')).toThrow(
      'You tried to call Updater.updatedAt() after you called Updater.execute(). Call updatedAt() before calling execute().'
    );
  });
  test('should fail if updatedAt string is empty string', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });

    // OPERATE n CHECK
    expect(() => updater.updatedAt('')).toThrow(
      `"" <== must be a string or Date and can not be empty to assign to updatedAt attribute.`
    );
  });
  test('should create a null attribute after marking', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });
    const expectedParams = {
      Key: { pk: { S: 'pk' } },
      TableName: 'sample-table',
      ReturnValues: 'ALL_NEW'
    };

    // OPERATE
    const generatedParams = updater
      .key({ pk: { S: 'pk' } })
      .mark(['pk'])
      .item({ pk: { NULL: true } })
      .getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('.rev()', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });
    const expectedParams = {
      TableName: 'sample-table',
      Key: { pk: { S: 'pk' } },
      ReturnValues: 'ALL_NEW',
      ConditionExpression: '#rev = :rev',
      ExpressionAttributeNames: { '#rev': 'rev' },
      ExpressionAttributeValues: { ':rev': { N: '2' }, ':_addOne': { N: '1' } },
      UpdateExpression: 'SET #rev = #rev + :_addOne'
    };

    // OPERATE
    const generatedParams = updater
      .key({ pk: { S: 'pk' } })
      .rev(2)
      .getParams();

    // CHECK
    expect(generatedParams).toEqual(expectedParams);
  });
  test('add createdAt to item', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });
    const expectedParams = {
      UpdateExpression:
        'SET #attr1 = :attr1, #attr2 = :attr2, #createdAt = if_not_exists(#createdAt, :createdAt), #updatedAt = :updatedAt'
    };

    // OPERATE
    const generatedParams = updater
      .key({ pk: { S: 'pk' } })
      .item({ pk: { S: 'pk' }, attr1: { S: 'attr1' }, attr2: { S: 'attr2' } })
      .getParams();

    // CHECK
    expect(generatedParams.UpdateExpression).toEqual(expectedParams.UpdateExpression);
  });
  test('add updatedAt to item', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });
    const expectedParams = {
      UpdateExpression:
        'SET #attr1 = :attr1, #attr2 = :attr2, #createdAt = if_not_exists(#createdAt, :createdAt), #updatedAt = :updatedAt'
    };

    // OPERATE
    const generatedParams = updater
      .key({ pk: { S: 'pk' } })
      .item({ pk: { S: 'pk' }, attr1: { S: 'attr1' }, attr2: { S: 'attr2' } })
      .getParams();

    // CHECK
    expect(generatedParams.UpdateExpression).toEqual(expectedParams.UpdateExpression);
  });
  test('.remove() with lists', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });
    const expectedParams = {
      UpdateExpression: 'REMOVE attr1ToRemove, attr2ToRemove'
    };

    // OPERATE
    const generatedParams = updater
      .key({ pk: { S: 'pk' } })
      .remove(['attr1ToRemove', 'attr2ToRemove'])
      .getParams();

    // CHECK
    expect(generatedParams.UpdateExpression).toEqual(expectedParams.UpdateExpression);
  });
  test('should fail if you condition is empty string', async () => {
    // BUILD
    const updater = new Updater({ region: 'us-east-1' }, 'sample-table', { pk: { S: 'pk' } });

    // OPERATE n CHECK
    expect(() => updater.condition('')).toThrow(`Condition cannot be empty`);
  });
});
