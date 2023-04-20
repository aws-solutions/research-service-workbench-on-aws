/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetDataSetMountPointResponse } from '@aws/workbench-core-datasets';
import { dataSetPrefix, endpointPrefix } from '@aws/workbench-core-example-app/lib/configs/constants';
import ClientSession from '../../support/clientSession';
import Dataset from '../../support/resources/datasets/dataset';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('datasets get integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  let fakeDataSetId: string;
  let fakeEndpointId: string;

  beforeEach(() => {
    expect.hasAssertions();

    fakeDataSetId = `${dataSetPrefix.toLowerCase()}-badbadba-dbad-badb-adba-dbadbadbadba`;
    fakeEndpointId = `${endpointPrefix.toLowerCase()}-badbadba-dbad-badb-adba-dbadbadbadba`;
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
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

    it('returns the endpoint mount object when the user has permission', async () => {
      const userId = adminSession.getSettings().get('rootUserId');
      const { data: endpointData } = await dataset.share({ userId });
      const endpoint = dataset.children.get(endpointData.mountObject.endpointId)!;
      const { data } = await endpoint.getMountObject();

      expect(data).toStrictEqual<GetDataSetMountPointResponse>(endpointData);
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
      // remove default authenticated user access
      const userId = adminSession.getSettings().get('rootUserId');
      await dataset.removeAccess({
        permission: {
          identity: userId,
          identityType: 'USER',
          accessLevel: 'read-only'
        }
      });
      // create a fake group and give it access to the dataset
      const { data: groupData } = await adminSession.resources.groups.create();
      await dataset.addAccess({
        permission: {
          identityType: 'GROUP',
          identity: groupData.groupId,
          accessLevel: 'read-only'
        }
      });
      //create an endpoint for the fake group
      const { data: endpointData } = await dataset.share({ groupId: groupData.groupId });
      const endpoint = dataset.children.get(endpointData.mountObject.endpointId)!;

      await expect(endpoint.getMountObject()).rejects.toThrow(new HttpError(403, {}));
    });

    it('throws when the calling user doesnt have permission on the endpoint', async () => {
      // create a fake group and give it access to the dataset
      const { data: groupData } = await adminSession.resources.groups.create();
      await dataset.addAccess({
        permission: {
          identityType: 'GROUP',
          identity: groupData.groupId,
          accessLevel: 'read-write'
        }
      });
      //create an endpoint for the fake group
      const { data: endpointData } = await dataset.share({ groupId: groupData.groupId });
      const endpoint = dataset.children.get(endpointData.mountObject.endpointId)!;

      await expect(endpoint.getMountObject()).rejects.toThrow(new HttpError(403, {}));
    });
  });
});
