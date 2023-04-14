/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import { DatasetHelper } from '../../support/complex/datasetHelper';
import Dataset from '../../support/resources/datasets/dataset';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('datasets file upload integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  const fakeDataSetId: string = 'example-ds-badbadba-dbad-badb-adba-dbadbadbadba';

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    try {
      adminSession = await setup.getDefaultAdminSession();
    } catch (e) {
      console.log(e);
    }
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('PresignedSinglePartUpload', () => {
    let dataset: Dataset;

    beforeAll(async () => {
      const {
        data: { id }
      } = await adminSession.resources.datasets.create({}, true);
      dataset = adminSession.resources.datasets.children.get(id) as Dataset;
    });

    it('generates a presigned URL and upload a file using that URL', async () => {
      const fileName = uuidv4();
      const response = await dataset.generateSinglePartFileUploadUrl({ fileName });

      await adminSession.getAxiosInstance().put(response.data.url, { fake: 'data' });

      const aws = setup.getMainAwsClient();
      const files = await DatasetHelper.listDatasetFileNames(aws, dataset.storageName, dataset.storagePath);
      expect(files.length > 0).toBe(true);
      expect(files).toContain(`${dataset.storagePath}/${fileName}`);
    });

    it('throws when generating a URL for a dataset that doesnt exist', async () => {
      const dataset = adminSession.resources.datasets.dataset({
        id: fakeDataSetId,
        awsAccountId: '',
        storageName: '',
        storagePath: ''
      });
      await expect(dataset.generateSinglePartFileUploadUrl({ fileName: '' })).rejects.toThrow(
        new HttpError(404, {})
      );
    });

    it('throws when generating a URL for a dataset with an invalid id', async () => {
      const dataset = adminSession.resources.datasets.dataset({
        id: 'fakeDataSetId',
        awsAccountId: '',
        storageName: '',
        storagePath: ''
      });
      await expect(dataset.generateSinglePartFileUploadUrl({ fileName: '' })).rejects.toThrow(
        new HttpError(403, {})
      );
    });

    it('throws when the fileName is missing in the request body', async () => {
      const invalidRequest: Record<string, unknown> = {};
      await expect(
        dataset.generateSinglePartFileUploadUrl(invalidRequest as { fileName: string })
      ).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the fileName in the request body is not a string', async () => {
      const invalidRequest: Record<string, unknown> = { fileName: 123 };
      await expect(
        dataset.generateSinglePartFileUploadUrl(invalidRequest as { fileName: string })
      ).rejects.toThrow(new HttpError(400, {}));
    });
  });
});
