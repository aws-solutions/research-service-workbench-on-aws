import _ from 'lodash';
import ClientSession from '../../support/clientSession';
import Dataset from '../../support/resources/datasets/dataset';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('datasets delete integration test', () => {
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

  describe('RemoveDataSets', () => {
    it('removes a dataset', async () => {
      const response = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = response.data.id;

      await expect(adminSession.resources.datasets.delete({ id: dataSetId })).resolves.not.toThrow();

      await expect(adminSession.resources.datasets.get({ id: dataSetId })).rejects.toThrow(
        new HttpError(404, 'Not Found')
      );
    });

    it('throws when removing a dataset which does not exist', async () => {
      await expect(adminSession.resources.datasets.delete({ id: fakeDataSetId })).rejects.toThrow(
        new HttpError(404, 'Not Found')
      );
    });

    it('throws when attempting to remove a DataSet with an endpoint', async () => {
      const response = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = response.data.id;
      const ds: Dataset = _.find(
        adminSession.resources.datasets.children,
        (d: Dataset) => d._id === dataSetId
      ) as unknown as Dataset;
      await ds.share({});

      await expect(adminSession.resources.datasets.delete({ id: dataSetId })).rejects.toThrow(
        new HttpError(
          500,
          'External endpoints found on Dataset must be removed before DataSet can be removed.'
        )
      );
    });
  });
});
