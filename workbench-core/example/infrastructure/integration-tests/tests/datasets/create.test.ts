/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
// import RandomTextGenerator from '../../../support/utils/randomTextGenerator';

describe('datasets integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  // const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('IntegrationTest', () => {
    test('should return DataSets entries', async () => {
      const response = await adminSession.resources.datasets.get({});
      expect(response.data).toEqual([]);
    });
  });
});
