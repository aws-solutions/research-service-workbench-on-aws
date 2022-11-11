/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('datasets integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  const fakeDataSetId: string = 'example-ds-badbadba-dbad-badb-adba-dbadbadbadba';

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
    describe('ListDataSets', () => {
      test('should return DataSets entries', async () => {
        const response = await adminSession.resources.datasets.get();
        expect(response.data).toBeDefined();
      });
    });

    describe('RemoveDataSets', () => {
      test('Remove a dataset', async () => {
        console.log('starting test');
        let response = await adminSession.resources.datasets.create({}, true);
        const dataSetId: string = response.data.id;
        console.log(`Created DataSet ${dataSetId}`);

        response = await adminSession.resources.datasets.delete({ id: dataSetId });
        console.log(response);
        expect(response.data.length).toEqual(0);
        console.log('Deleted.');

        await expect(adminSession.resources.datasets.get({ id: dataSetId })).rejects.toThrow(
          new HttpError(404, 'Not Found')
        );
        console.log('Delete verified');
      });

      test('Remove a dataset which does not exist', async () => {
        await expect(adminSession.resources.datasets.delete({ id: fakeDataSetId })).resolves.toBeDefined();
      });
    });
  });
});
