/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { marshall } from '@aws-sdk/util-dynamodb';
import { addPaginationToken, getPaginationToken } from './paginationHelper';

describe('paginationHelper', () => {
  describe('addPaginationToken', () => {
    test('with valid paginationToken', async () => {
      // BUILD
      const paginationToken =
        'eyJjcmVhdGVkQXQiOiIyMDIyLTEwLTI3VDIxOjM0OjIzLjM1NFoiLCJzayI6IlBST0ojcHJvai01MzEyY2NjMS01ZTAxLTQ4ZjgtODBhMS0yNjcyNWEzMTgwYzgiLCJyZXNvdXJjZVR5cGUiOiJwcm9qZWN0IiwicGsiOiJQUk9KI3Byb2otNTMxMmNjYzEtNWUwMS00OGY4LTgwYTEtMjY3MjVhMzE4MGM4In0';

      // OPERATE
      const results = addPaginationToken(paginationToken, {});

      // OPERATE
      expect(results).toEqual({
        start: {
          createdAt: '2022-10-27T21:34:23.354Z',
          sk: 'PROJ#proj-5312ccc1-5e01-48f8-80a1-26725a3180c8',
          resourceType: 'project',
          pk: 'PROJ#proj-5312ccc1-5e01-48f8-80a1-26725a3180c8'
        }
      });
    });
    test('with invalid paginationToken', async () => {
      // BUILD
      const paginationToken = undefined;

      // OPERATE
      const results = addPaginationToken(paginationToken, {});

      // OPERATE
      expect(results).toEqual({});
    });
  });
  describe('getPaginationToken', () => {
    test('with LastEvaluatedKey', async () => {
      // BUILD
      const ddbQueryResponse = {
        LastEvaluatedKey: marshall({
          createdAt: '2022-10-27T21:34:23.354Z',
          sk: 'PROJ#proj-5312ccc1-5e01-48f8-80a1-26725a3180c8',
          resourceType: 'project',
          pk: 'PROJ#proj-5312ccc1-5e01-48f8-80a1-26725a3180c8'
        }),
        $metadata: {}
      };

      // OPERATE
      const results = getPaginationToken(ddbQueryResponse);

      // CHECK
      expect(results).toEqual(
        'eyJjcmVhdGVkQXQiOnsiUyI6IjIwMjItMTAtMjdUMjE6MzQ6MjMuMzU0WiJ9LCJzayI6eyJTIjoiUFJPSiNwcm9qLTUzMTJjY2MxLTVlMDEtNDhmOC04MGExLTI2NzI1YTMxODBjOCJ9LCJyZXNvdXJjZVR5cGUiOnsiUyI6InByb2plY3QifSwicGsiOnsiUyI6IlBST0ojcHJvai01MzEyY2NjMS01ZTAxLTQ4ZjgtODBhMS0yNjcyNWEzMTgwYzgifX0='
      );
    });
  });
});
