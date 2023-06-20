/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { DataSet } from '@aws/workbench-core-datasets';
import { dataSetPrefix } from '@aws/workbench-core-example-app/lib/configs/constants';
import { CreateUser } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Dataset from '../../support/resources/datasets/dataset';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('datasets delete integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let user: CreateUser;
  let userId: string;
  const mockBadValue: string = 'fake-data';

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    user = {
      firstName: 'Test',
      lastName: 'User',
      email: `success+delete-dataset-${uuidv4()}@simulator.amazonses.com`
    };
    const userData = await adminSession.resources.users.create(user);
    userId = userData.data.id;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('RemoveDataSets', () => {
    it('removes a dataset', async () => {
      const response = await adminSession.resources.datasets.create({}, true);
      // remove property not normally part of a dataset.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { authenticatedUser, ...dataSet } = response.data;

      const deleteResponse = await adminSession.resources.datasets.children.get(dataSet.id!)!.delete();
      const deleted: DataSet = deleteResponse.data;

      expect(deleted).toStrictEqual<DataSet>(dataSet);

      await expect(adminSession.resources.datasets.get({ id: dataSet.id! })).rejects.toThrowError(
        new HttpError(404, 'Not Found')
      );
    });

    it('throws when removing a dataset which does not exist', async () => {
      const fakeDataSet: Dataset = adminSession.resources.datasets.dataset({
        id: `${dataSetPrefix.toLowerCase()}-${uuidv4()}`,
        awsAccountId: mockBadValue,
        storageName: mockBadValue,
        storagePath: mockBadValue
      });
      await expect(fakeDataSet.delete()).rejects.toThrow(new HttpError(404, 'Not Found'));
    });

    it('throws when attempting to remove a DataSet with an endpoint', async () => {
      const response = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = response.data.id;
      const ds: Dataset = adminSession.resources.datasets.children.get(dataSetId) as Dataset;
      await ds.addAccess({
        permission: {
          identityType: 'USER',
          identity: userId,
          accessLevel: 'read-only'
        }
      });
      await ds.share({ userId: userId });

      await expect(adminSession.resources.datasets.children.get(dataSetId)!.delete()).rejects.toThrow(
        new HttpError(
          400,
          'External endpoints found on Dataset must be removed before DataSet can be removed.'
        )
      );
    });

    it('throws when dataset Id passed to remove is not a UUID', async () => {
      const fakeDataSet: Dataset = adminSession.resources.datasets.dataset({
        id: 'this is not a UUID!',
        awsAccountId: mockBadValue,
        storageName: mockBadValue,
        storagePath: mockBadValue
      });
      await expect(fakeDataSet.delete()).rejects.toThrow(
        new HttpError(403, 'User is forbidden: Route has not been secured')
      );
    });
  });
});
