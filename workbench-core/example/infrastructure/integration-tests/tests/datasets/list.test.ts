/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';

describe('datasets list integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('ListDataSets', () => {
    it('should return DataSets entries', async () => {
      const response = await adminSession.resources.datasets.get();
      expect(response.data).toBeDefined();
    });
  });
});
