/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError, generateInvalidIds } from '../../../support/utils/utilities';

describe('get dataset for project tests', () => {
  let paabHelper: PaabHelper;
  let itAdminSession: ClientSession;
  let researcher1Session: ClientSession;
  let pa1Session: ClientSession;
  let project1Id: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    paabHelper = new PaabHelper(1);
    const paabResources = await paabHelper.createResources();
    itAdminSession = paabResources.adminSession;
    researcher1Session = paabResources.rs1Session;
    pa1Session = paabResources.pa1Session;
    project1Id = paabResources.project1Id;
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
  });
});
