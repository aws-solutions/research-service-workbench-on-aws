/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetDataSetMountPointResponse } from '@aws/workbench-core-datasets';
import ClientSession from '../../support/clientSession';
import Dataset from '../../support/resources/datasets/dataset';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';

describe('datasets get integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let randomTextGenerator: RandomTextGenerator;

  let fakeDataSetId: string;
  let fakeEndpointId: string;
  let fakeGroupId: string;

  beforeEach(() => {
    expect.hasAssertions();

    fakeDataSetId = 'example-ds-badbadba-dbad-badb-adba-dbadbadbadba';
    fakeEndpointId = 'example-ds-badbadba-dbad-badb-adba-dbadbadbadba'; // TODO
    fakeGroupId = randomTextGenerator.getFakeText('test-authZ-group');
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    randomTextGenerator = new RandomTextGenerator(adminSession.getSettings().get('runId'));
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('GetDataSetMountObject', () => {
    let dataset: Dataset;

    beforeEach(async () => {
      const { data } = await adminSession.resources.datasets.create();
      dataset = adminSession.resources.datasets.children.get(data.id) as Dataset;
    });

    it('returns the endpoint mount object when the user id gives permission', async () => {
      const userId = adminSession.getSettings().get('userId');
      const permission = {
        identityType: 'USER',
        identity: userId,
        accessLevel: 'read-only'
      };
      await dataset.addAccess({ permission });
      const { data: endpointData } = await dataset.share({ userId: userId });
      const endpoint = dataset.children.get(endpointData.id)!;
      const { data } = await endpoint.getMountObject();
      await dataset.removeAccess({ permission });

      expect(data).toMatchObject<GetDataSetMountPointResponse>({
        data: {
          mountObject: {
            name: '',
            bucket: '',
            prefix: '',
            endpointId: ''
          }
        }
      });
    });

    it('returns the endpoint mount object when the user role gives permission', async () => {
      const userId = adminSession.getSettings().get('userId');
      const { data: groupData } = await adminSession.resources.groups.create();
      const { groupId } = groupData;
      const permission = {
        identityType: 'GROUP',
        identity: groupId,
        accessLevel: 'read-only'
      };
      await adminSession.resources.groups.group(groupId).addUser({ userId });
      await dataset.addAccess({ permission });
      const { data: endpointData } = await dataset.share({ groupId });
      const endpoint = dataset.children.get(endpointData.id)!;
      const { data } = await endpoint.getMountObject();
      await dataset.removeAccess({ permission });

      expect(data).toMatchObject<GetDataSetMountPointResponse>({
        data: {
          mountObject: {
            name: '',
            bucket: '',
            prefix: '',
            endpointId: ''
          }
        }
      });
    });

    it('throws when getting the mount object of a dataset which does not exist', async () => {
      await expect(
        adminSession.resources.datasets
          .dataset({ id: fakeDataSetId, awsAccountId: '', storageName: '', storagePath: '' })
          .endpoint({ id: fakeEndpointId, externalEndpointName: '' })
          .getMountObject()
      ).rejects.toThrow(new HttpError(404, {}));
    });

    it('throws when getting the mount object of an endpoint which does not exist', async () => {
      await expect(
        dataset.endpoint({ id: fakeEndpointId, externalEndpointName: '' }).getMountObject()
      ).rejects.toThrow(new HttpError(404, {}));
    });

    it('throws when the calling user doesnt have permission on the dataset', async () => {
      const { data: endpointData } = await dataset.share({ groupId: fakeGroupId });
      const endpoint = dataset.children.get(endpointData.id)!;

      await expect(endpoint.getMountObject()).rejects.toThrow(new HttpError(403, {}));
    });

    it('throws when the calling user doesnt have permission on the endpoint', async () => {
      const userId = adminSession.getSettings().get('userId');
      const permission = {
        identityType: 'USER',
        identity: userId,
        accessLevel: 'read-only'
      };
      await dataset.addAccess({ permission });
      const { data: endpointData } = await dataset.share({ groupId: fakeGroupId });
      const endpoint = dataset.children.get(endpointData.id)!;

      await expect(endpoint.getMountObject()).rejects.toThrow(new HttpError(403, {}));
      await dataset.removeAccess({ permission });
    });
  });
});
