/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
// import RandomTextGenerator from '../../../support/utils/randomTextGenerator';

describe('datasets create negative tests', () => {
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
    test('should return DataSets entry', async () => {
      const response = await adminSession.resources.datasets.get({});
      expect(response.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ pk: 'EXAMPLE-DS#example-ds-c8c71ba1-4111-489c-98b5-05c24f0a3a36' })
        ])
      );
    });
  });
});
