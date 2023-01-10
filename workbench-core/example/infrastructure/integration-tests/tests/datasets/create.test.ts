/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AddDataSetExternalEndpointResponse } from '@aws/workbench-core-datasets';
import ClientSession from '../../support/clientSession';
import Dataset from '../../support/resources/datasets/dataset';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import { accessPointS3AliasRegExp, endpointIdRegExp } from '../../support/utils/regExpressions';

describe('datasets create integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  let fakeDataSetId: string;
  let fakeGroupId: string;

  beforeEach(() => {
    expect.hasAssertions();

    fakeDataSetId = 'example-ds-badbadba-dbad-badb-adba-dbadbadbadba';
    fakeGroupId = 'fake-group-id';
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('AddExternalEndpoint', () => {
    let dataset: Dataset;

    beforeEach(async () => {
      const { data } = await adminSession.resources.datasets.create();
      dataset = adminSession.resources.datasets.children.get(data.id) as Dataset;
    });

    it('creates an endpoint for a user for a dataset', async () => {
      const response = await dataset.share();

      expect(response).toMatchObject<AddDataSetExternalEndpointResponse>({
        data: {
          mountObject: {
            name: dataset.storagePath,
            bucket: expect.stringMatching(accessPointS3AliasRegExp),
            prefix: dataset.storagePath,
            endpointId: expect.stringMatching(endpointIdRegExp)
          }
        }
      });
    });

    it('creates an endpoint for a group for a dataset', async () => {
      const response = await dataset.share({ groupId: fakeGroupId });

      expect(response).toMatchObject<AddDataSetExternalEndpointResponse>({
        data: {
          mountObject: {
            name: dataset.storagePath,
            bucket: expect.stringMatching(accessPointS3AliasRegExp),
            prefix: dataset.storagePath,
            endpointId: expect.stringMatching(endpointIdRegExp)
          }
        }
      });
    });

    it('throws when adding an endpoint to a dataset which does not exist', async () => {
      await expect(
        adminSession.resources.datasets
          .dataset({ id: fakeDataSetId, awsAccountId: '', storageName: '', storagePath: '' })
          .share()
      ).rejects.toThrow(new HttpError(404, {}));
    });

    it('throws when attempting to create an endpoint that already exists', async () => {
      const randomTextGenerator = new RandomTextGenerator(adminSession.getSettings().get('runId'));
      const externalEndpointName = `ap-${randomTextGenerator.getFakeText('test-EP').toLowerCase()}`;

      await dataset.share({ externalEndpointName });

      await expect(dataset.share({ externalEndpointName })).rejects.toThrow(new HttpError(400, {}));
    });

    // TODO unskip once datasets authZ is completed
    it.skip('throws when the groupId doesnt have permission to access the dataset', async () => {
      await expect(dataset.share()).rejects.toThrow(new HttpError(403, {}));
    });

    // TODO unskip once datasets authZ is completed
    it.skip('throws when the userId doesnt have permission to access the dataset', async () => {
      await expect(dataset.share({ groupId: fakeGroupId })).rejects.toThrow(new HttpError(403, {}));
    });
  });
});
