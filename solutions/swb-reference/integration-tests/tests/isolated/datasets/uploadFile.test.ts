/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { DataSet } from '@aws/workbench-core-datasets';
import axios from 'axios';
import { getProjectAdminRole } from '../../../../src/utils/roleUtils';
import ClientSession from '../../../support/clientSession';
import { DatasetHelper } from '../../../support/complex/datasetHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import Settings from '../../../support/utils/settings';
import { checkHttpError } from '../../../support/utils/utilities';

describe('datasets file upload tests', () => {
  const setup: Setup = new Setup();
  const settings: Settings = setup.getSettings();
  let adminSession: ClientSession;
  let datasetHelper: DatasetHelper;

  let dataSet: DataSet;

  beforeEach(async () => {
    expect.hasAssertions();

    const { data } = await adminSession.resources.datasets.create({
      storageName: settings.get('DataSetsBucketName'),
      awsAccountId: settings.get('mainAccountId'),
      region: settings.get('awsRegion'),
      owner: getProjectAdminRole(settings.get('projectId')),
      ownerType: 'GROUP',
      type: 'internal'
    });
    dataSet = data;
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    datasetHelper = new DatasetHelper();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  it('returns the presigned upload url when one file name is passed in', async () => {
    const filename = 'TestFile1';

    // get presigned URL
    const { data } = await adminSession.resources.datasets.dataset(dataSet.id).getFileUploadUrls(filename);

    // Add a fake file using the URL
    await Promise.all(data.urls.map((url: string) => axios.put(url, 'fake data')));

    // get the fake file names
    const objectNames = await datasetHelper.getS3ObjectNames(dataSet.storageName, dataSet.path);

    expect(data.urls.length).toBe(1);
    expect(objectNames).toEqual(expect.arrayContaining([`${dataSet.path}/${filename}`]));
  });

  it('returns the presigned upload url when two file names are passed in', async () => {
    const filenames = ['TestFile1', 'TestFile2'];

    // get presigned URLs
    const { data } = await adminSession.resources.datasets.dataset(dataSet.id).getFileUploadUrls(filenames);

    // Add fake files using the URLs
    await Promise.all(data.urls.map((url: string) => axios.put(url, 'fake data')));

    // get the fake file names
    const objectNames = await datasetHelper.getS3ObjectNames(dataSet.storageName, dataSet.path);

    expect(data.urls.length).toBe(2);
    expect(objectNames).toEqual(
      expect.arrayContaining(filenames.map((filename) => `${dataSet.path}/${filename}`))
    );
  });

  it('returns a 400 error when no file names are passed in', async () => {
    try {
      await adminSession.resources.datasets.dataset(dataSet.id).getFileUploadUrls();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: 'filenames: Invalid input'
        })
      );
    }
  });
});
