/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const randomUuid = '6d4e4f5b-8121-4bfb-b2c1-68b133177bbb';
jest.mock('uuid', () => ({ v4: () => randomUuid }));

import { runInBatches } from './promiseUtils';

describe('promiseUtils', () => {
  describe('runInBatches', () => {
    test('run in batches without remainder', async () => {
      const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];

      const result = await runInBatches<number>(promises, 1);

      expect(result).toEqual([1, 2, 3]);
    });

    test('run in batches with remainder', async () => {
      const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];

      const result = await runInBatches<number>(promises, 2);

      expect(result).toEqual([1, 2, 3]);
    });
  });
});
