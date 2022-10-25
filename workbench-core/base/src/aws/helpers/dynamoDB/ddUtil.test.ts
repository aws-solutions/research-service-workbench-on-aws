/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { buildDynamoDbKey, buildDynamoDBPkSk } from './ddbUtil';

describe('ddbUtil', () => {
  describe('buildDynamoDbKey', () => {
    test('it builds the expected key pattern', () => {
      const id = 'id';
      const type = 'type';
      expect(buildDynamoDbKey(id, type)).toEqual('type#id');
    });
  });

  describe('buildDynamoDBPkSk', () => {
    test('it uses the same key for PK and SK', () => {
      const id = 'id';
      const type = 'type';
      expect(buildDynamoDBPkSk(id, type)).toEqual({
        pk: 'type#id',
        sk: 'type#id'
      });
    });
  });
});
