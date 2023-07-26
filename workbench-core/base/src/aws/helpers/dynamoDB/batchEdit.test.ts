/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import BatchEdit from './batchEdit';

// The tests in this file test for scenarios that are not possible is you use the dynamoDBService to initialize/use batchEdit

describe('batchEdit', () => {
  test('should fail adding a write request if RequestItems is undefined', async () => {
    // BUILD
    const batchEdit = new BatchEdit({ region: 'us-east-1' }, 'sample-table');
    batchEdit.getParams().RequestItems = undefined;

    // OPERATE n CHECK
    expect(() => batchEdit.addWriteRequest({})).toThrow(
      'BatchEdit<==need to initialize the RequestItems property before adding new request'
    );
  });
  test('should fail adding a delete request if RequestItems is undefined', async () => {
    // BUILD
    const batchEdit = new BatchEdit({ region: 'us-east-1' }, 'sample-table');
    batchEdit.getParams().RequestItems = undefined;

    // OPERATE n CHECK
    expect(() => batchEdit.addDeleteRequest({})).toThrow(
      'BatchEdit<==need to initialize the RequestItems property before adding new request'
    );
  });
});
