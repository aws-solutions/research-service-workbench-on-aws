/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { CreateDataSetRequestParser } from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError, generateInvalidIds } from '../../../support/utils/utilities';

describe('get dataset for project tests', () => {
  const paabHelper: PaabHelper = new PaabHelper(2);
  const setup = Setup.getSetup();
  const settings = setup.getSettings();
  let itAdminSession: ClientSession;
  let researcher1Session: ClientSession;
  let pa1Session: ClientSession;
  let pa2Session: ClientSession;
  let anonymousSession: ClientSession;
  let project1Id: string;
  let project2Id: string;
  let dataSet1Id: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    itAdminSession = paabResources.adminSession;
    researcher1Session = paabResources.rs1Session;
    pa1Session = paabResources.pa1Session;
    pa2Session = paabResources.pa2Session;
    anonymousSession = paabResources.anonymousSession;
    project1Id = paabResources.project1Id;
    project2Id = paabResources.project2Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('negative tests', () => {
    const invalidDatasets: string[] = generateInvalidIds('dataset');
    test.each(invalidDatasets)(
      'invalid dataset Id throws validation exception for Admin',
      async (invalidDataset) => {
        try {
          await itAdminSession.resources.projects
            .project(project1Id)
            .dataSets()
            .dataset(invalidDataset)
            .get();
        } catch (error) {
          checkHttpError(
            error,
            new HttpError(400, {
              error: 'Bad Request',
              message: `dataSetId: Invalid ID`
            })
          );
        }
      }
    );
    test.each(invalidDatasets)('non-existing dataset Id throws 403 for PA', async (invalidDataset) => {
      try {
        await pa1Session.resources.projects.project(project1Id).dataSets().dataset(invalidDataset).get();
      } catch (error) {
        checkHttpError(
          error,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });
    test.each(invalidDatasets)(
      'non-existing dataset Id throws 403 for Researcher',
      async (invalidDataset) => {
        try {
          await researcher1Session.resources.projects
            .project(project1Id)
            .dataSets()
            .dataset(invalidDataset)
            .get();
        } catch (error) {
          checkHttpError(
            error,
            new HttpError(403, {
              error: 'User is not authorized'
            })
          );
        }
      }
    );

    describe('unauthorized to access', () => {
      beforeAll(async () => {
        const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
        const dataset1Name = randomTextGenerator.getFakeText('isolated-get-datasets-for-project-ds1');
        const dataSetBody = CreateDataSetRequestParser.parse({
          storageName: settings.get('DataSetsBucketName'),
          awsAccountId: settings.get('mainAccountId'),
          path: dataset1Name, // using same name to help potential troubleshooting
          name: dataset1Name,
          region: settings.get('awsRegion'),
          type: 'internal'
        });
        const { data: dataSet1 } = await pa2Session.resources.projects
          .project(project2Id)
          .dataSets()
          .create(dataSetBody, false);
        dataSet1Id = dataSet1.id;
      });

      test('PA without access to dataset cannot get', async () => {
        try {
          await pa1Session.resources.projects.project(project2Id).dataSets().dataset(dataSet1Id).get();
        } catch (error) {
          checkHttpError(
            error,
            new HttpError(403, {
              error: 'User is not authorized'
            })
          );
        }
      });

      test('Researcher without access to dataset cannot get', async () => {
        try {
          await researcher1Session.resources.projects
            .project(project2Id)
            .dataSets()
            .dataset(dataSet1Id)
            .get();
        } catch (error) {
          checkHttpError(
            error,
            new HttpError(403, {
              error: 'User is not authorized'
            })
          );
        }
      });

      test('Unauthenticated user cannot get', async () => {
        try {
          await anonymousSession.resources.projects.project(project2Id).dataSets().dataset(dataSet1Id).get();
        } catch (error) {
          checkHttpError(error, new HttpError(401, {}));
        }
      });
    });
  });
});
