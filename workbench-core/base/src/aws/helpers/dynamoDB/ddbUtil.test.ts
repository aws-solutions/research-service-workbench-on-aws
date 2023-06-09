/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { buildConcatenatedSk, buildDynamoDbKey, buildDynamoDBPkSk, removeDynamoDbKeys } from './ddbUtil';

describe('ddbUtil', () => {
  describe('buildConcatenatedSk', () => {
    test('it builds the expected key pattern', () => {
      const key1 = 'RESOURCE#resource-1';
      const key2 = 'RESOURCE#resource-2';
      expect(buildConcatenatedSk([key1, key2])).toEqual(key1 + key2);
    });
  });

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

  describe('removeDynamoDbKeys', () => {
    let entry: { [key: string]: string };

    beforeEach(() => {
      entry = {
        pk: 'pk',
        sk: 'sk',
        dependency: 'dependency',
        keepThis: 'keepThis'
      };
    });

    test('it removes the pk, sk, and dependency', () => {
      const dynamoItem = entry as { [key: string]: never };
      expect(removeDynamoDbKeys(dynamoItem)).toEqual({ keepThis: 'keepThis' });
    });
  });
});
