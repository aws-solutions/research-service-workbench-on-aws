/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AddDataSetExternalEndpointResponse } from '@aws/workbench-core-datasets';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Dataset from '../../support/resources/datasets/dataset';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import { accessPointS3AliasRegExp, endpointIdRegExp } from '../../support/utils/regExpressions';

describe('datasets create integration test', () => {
  let setup: Setup;
  let adminSession: ClientSession;
  let randomTextGenerator: RandomTextGenerator;

  let fakeDataSetId: string;

  beforeEach(() => {
    expect.hasAssertions();

    fakeDataSetId = 'example-ds-badbadba-dbad-badb-adba-dbadbadbadba';
  });

  beforeAll(async () => {
    setup = new Setup();
    adminSession = await setup.getDefaultAdminSession();
    randomTextGenerator = new RandomTextGenerator(adminSession.getSettings().get('runId'));
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('AddExternalEndpointForUser', () => {
    let dataset: Dataset;
    let userId: string;
    let identityType: string;

    beforeAll(async () => {
      identityType = 'USER';
      const { data } = await adminSession.resources.users.create({
        firstName: 'Test',
        lastName: 'User',
        email: `success+add-external-endpoint-${uuidv4()}@simulator.amazonses.com`
      });
      userId = data.id;
    });

    beforeEach(async () => {
      const { data } = await adminSession.resources.datasets.create();
      dataset = adminSession.resources.datasets.children.get(data.id) as Dataset;
    });

    it('creates an endpoint for a user for a dataset', async () => {
      await dataset.addAccess({
        permission: {
          identityType,
          identity: userId,
          accessLevel: 'read-only'
        }
      });
      const response = await dataset.share({ userId });

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
          .share({ userId })
      ).rejects.toThrow(new HttpError(404, {}));
    });

    it('throws when attempting to create an endpoint that already exists', async () => {
      const externalEndpointName = `ap-${randomTextGenerator.getFakeText('test-EP').toLowerCase()}`;

      await dataset.addAccess({
        permission: {
          identityType,
          identity: userId,
          accessLevel: 'read-only'
        }
      });
      await dataset.share({ externalEndpointName, userId });

      await expect(dataset.share({ externalEndpointName, userId })).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the userId doesnt have permission to access the dataset', async () => {
      await expect(dataset.share({ userId })).rejects.toThrow(new HttpError(403, {}));
    });
  });

  describe('AddExternalEndpointForGroup', () => {
    let dataset: Dataset;
    let groupId: string;
    let identityType: string;

    beforeAll(async () => {
      identityType = 'GROUP';
      groupId = randomTextGenerator.getFakeText('test-authZ-group');
      await adminSession.resources.groups.create({ groupId });
    });

    beforeEach(async () => {
      const { data } = await adminSession.resources.datasets.create();
      dataset = adminSession.resources.datasets.children.get(data.id) as Dataset;
    });

    it('creates an endpoint for a group for a dataset', async () => {
      await dataset.addAccess({
        permission: {
          identityType,
          identity: groupId,
          accessLevel: 'read-only'
        }
      });
      const response = await dataset.share({ groupId });

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
          .share({ groupId })
      ).rejects.toThrow(new HttpError(404, {}));
    });

    it('throws when attempting to create an endpoint that already exists', async () => {
      const randomTextGenerator = new RandomTextGenerator(adminSession.getSettings().get('runId'));
      const externalEndpointName = `ap-${randomTextGenerator.getFakeText('test-EP').toLowerCase()}`;

      await dataset.addAccess({
        permission: {
          identityType,
          identity: groupId,
          accessLevel: 'read-only'
        }
      });
      await dataset.share({ externalEndpointName, groupId });

      await expect(dataset.share({ externalEndpointName, groupId })).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the groupId doesnt have permission to access the dataset', async () => {
      await expect(dataset.share({ groupId })).rejects.toThrow(new HttpError(403, {}));
    });
  });
});
