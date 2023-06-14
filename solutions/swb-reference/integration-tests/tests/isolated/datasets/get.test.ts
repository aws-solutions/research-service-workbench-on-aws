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
import Settings from '../../../support/utils/settings';
import { checkHttpError, generateInvalidIds } from '../../../support/utils/utilities';

describe('datasets get negative tests', () => {
  const paabHelper: PaabHelper = new PaabHelper(3);
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let anonymousSession: ClientSession;
  let project1Id: string;
  let project3Id: string;
  let researcherSession: ClientSession;
  let dataSet1Id: string;
  const setup: Setup = Setup.getSetup();
  const settings: Settings = setup.getSettings();

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    adminSession = paabResources.adminSession;
    pa1Session = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
    project1Id = paabResources.project1Id;
    project3Id = paabResources.project3Id;

    const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
    const dataset1Name = randomTextGenerator.getFakeText('isolated-datasets-get-ds1');
    const dataSetBody = CreateDataSetRequestParser.parse({
      storageName: settings.get('DataSetsBucketName'),
      awsAccountId: settings.get('mainAccountId'),
      path: dataset1Name, // using same name to help potential troubleshooting
      name: dataset1Name,
      region: settings.get('awsRegion'),
      type: 'internal'
    });
    const { data: dataSet1 } = await pa1Session.resources.projects
      .project(project1Id)
      .dataSets()
      .create(dataSetBody, false);
    dataSet1Id = dataSet1.id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('ITAdmin tests', () => {
    const invalidDatasets: string[] = generateInvalidIds('dataset');
    test.each(invalidDatasets)(
      'invalid dataset Id throws validation exception for Admin',
      async (invalidDataset) => {
        try {
          await adminSession.resources.datasets.dataset(invalidDataset).get();
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
  });

  describe('PA tests', () => {
    test('it should fail with unauthorized with no project', async () => {
      try {
        await pa1Session.resources.datasets.dataset(dataSet1Id).get();
      } catch (error) {
        checkHttpError(
          error,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('it should fail with a different projectId', async () => {
      try {
        await pa1Session.resources.projects.project(project3Id).dataSets().dataset(dataSet1Id).get();
      } catch (error) {
        checkHttpError(
          error,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });
  });

  describe('Researcher tests', () => {
    test('it should fail with unauthorized with no project', async () => {
      try {
        await researcherSession.resources.datasets.dataset(dataSet1Id).get();
      } catch (error) {
        checkHttpError(
          error,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('it should fail with a different projectId', async () => {
      try {
        await researcherSession.resources.projects.project(project3Id).dataSets().dataset(dataSet1Id).get();
      } catch (error) {
        checkHttpError(
          error,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });
  });

  test('Unauthenticated user cannot get dataset', async () => {
    try {
      await anonymousSession.resources.projects.project(project3Id).dataSets().dataset(dataSet1Id).get();
    } catch (error) {
      checkHttpError(error, new HttpError(401, {}));
    }
  });
});
