/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('datasets create negative tests', () => {
  let pa1Session: ClientSession;
  let pa2Session: ClientSession;
  let researcher1Sesssion: ClientSession;
  let project1Id: string;
  let paabHelper: PaabHelper;
  let adminSession: ClientSession;

  beforeAll(async () => {
    paabHelper = new PaabHelper();
    const paabResources = await paabHelper.createResources();
    project1Id = paabResources.project1Id;
    pa1Session = paabResources.pa1Session;
    pa2Session = paabResources.pa2Session;
    researcher1Sesssion = paabResources.rs1Session;
    adminSession = paabResources.adminSession;

    expect.hasAssertions();
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('missing parameters', () => {
    test('returns an error specifying the missing parameters', async () => {
      try {
        await pa1Session.resources.projects.project(project1Id).dataSets().create({}, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message:
              'name: Required. storageName: Required. path: Required. awsAccountId: Required. region: Required. type: Required'
          })
        );
      }
    });
  });

  describe('datasets creation requests returns a 403 for', () => {
    const expectedError = new HttpError(403, {
      error: 'User is not authorized'
    });

    test('Researchers who belong to the project', async () => {
      try {
        const createRequest = paabHelper.createDatasetRequest(project1Id);
        await researcher1Sesssion.resources.datasets.create(createRequest, false);
      } catch (actualError) {
        checkHttpError(actualError, expectedError);
      }
    });

    test('ProjectAdmins who belong to another project', async () => {
      try {
        const createRequest = paabHelper.createDatasetRequest(project1Id);
        await pa2Session.resources.datasets.create(createRequest, false);
      } catch (actualError) {
        checkHttpError(actualError, expectedError);
      }
    });

    test('ITAdmins', async () => {
      try {
        const createRequest = paabHelper.createDatasetRequest(project1Id);
        await adminSession.resources.datasets.create(createRequest, false);
      } catch (actualError) {
        console.log(JSON.stringify(actualError));
        console.log(JSON.stringify(expectedError));
        checkHttpError(actualError, expectedError);
      }
    });
  });
});
