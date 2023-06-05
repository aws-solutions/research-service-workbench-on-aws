/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { DataSet } from '@aws/swb-app';
import axios from 'axios';
import ClientSession from '../../../support/clientSession';
import { DatasetHelper } from '../../../support/complex/datasetHelper';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import Settings from '../../../support/utils/settings';
import { checkHttpError } from '../../../support/utils/utilities';

describe('datasets file upload tests', () => {
  const paabHelper: PaabHelper = new PaabHelper();
  const setup: Setup = Setup.getSetup();
  const settings: Settings = setup.getSettings();
  let datasetHelper: DatasetHelper;
  let pa1Session: ClientSession;
  let pa2Session: ClientSession;
  let project1Id: string;
  let project2Id: string;
  let dataSet: DataSet;

  beforeEach(async () => {
    expect.hasAssertions();

    const { data } = await pa1Session.resources.projects
      .project(project1Id)
      .dataSets()
      .create({
        storageName: settings.get('DataSetsBucketName'),
        awsAccountId: settings.get('mainAccountId'),
        region: settings.get('awsRegion'),
        type: 'internal'
      });
    dataSet = data;
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources();
    project1Id = paabResources.project1Id;
    project2Id = paabResources.project2Id;

    pa1Session = paabResources.pa1Session;
    pa2Session = paabResources.pa2Session;
    datasetHelper = new DatasetHelper();
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('when trying to upload a file for a project that is', () => {
    describe('the owner of the dataset"', () => {
      it('returns the presigned upload url when one file name is passed in', async () => {
        const filename = 'TestFile1';

        // get presigned URL
        const { data } = await pa1Session.resources.projects
          .project(project1Id)
          .dataSets()
          .dataset(dataSet.id)
          .getFileUploadUrls(filename);

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
        const { data } = await pa1Session.resources.projects
          .project(project1Id)
          .dataSets()
          .dataset(dataSet.id)
          .getFileUploadUrls(filenames);

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
          await pa1Session.resources.projects
            .project(project1Id)
            .dataSets()
            .dataset(dataSet.id)
            .getFileUploadUrls();
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

      it('returns a 400 error when an invalid file name is passed in', async () => {
        try {
          await pa1Session.resources.projects
            .project(project1Id)
            .dataSets()
            .dataset(dataSet.id)
            .getFileUploadUrls('invalid?file*name');
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'filenames: must contain only letters, numbers, hyphens, underscores, and periods'
            })
          );
        }
      });

      it('receives a 403 if dataSet does not exist', async () => {
        try {
          await pa1Session.resources.projects
            .project(project1Id)
            .dataSets()
            .dataset('dataset-12345678-1234-1234-123f-1234567890ab')
            .getFileUploadUrls('TestFile1');
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(403, {
              error: 'User is not authorized'
            })
          );
        }
      });
    });

    describe('not the owner of the dataset', () => {
      describe('and has "read-only" access', () => {
        beforeEach(async () => {
          await pa1Session.resources.projects
            .project(project1Id)
            .dataSets()
            .dataset(dataSet.id)
            .associateWithProject(project2Id, 'read-only');
        });

        it('receives a 403 when trying to get a file upload URL', async () => {
          try {
            await pa2Session.resources.projects
              .project(project1Id)
              .dataSets()
              .dataset(dataSet.id)
              .getFileUploadUrls('TestFile1');
          } catch (e) {
            checkHttpError(
              e,
              new HttpError(403, {
                error: 'User is not authorized'
              })
            );
          }
        });
      });

      describe('and has "read-write" access', () => {
        beforeEach(async () => {
          await pa1Session.resources.projects
            .project(project1Id)
            .dataSets()
            .dataset(dataSet.id)
            .associateWithProject(project2Id, 'read-write');
        });

        it('receives a 200 when trying to get a file upload URL', async () => {
          const result = await pa2Session.resources.projects
            .project(project1Id)
            .dataSets()
            .dataset(dataSet.id)
            .getFileUploadUrls('TestFile1');

          expect(result.data.urls.length).toBe(1);
        });
      });
    });
  });
});
