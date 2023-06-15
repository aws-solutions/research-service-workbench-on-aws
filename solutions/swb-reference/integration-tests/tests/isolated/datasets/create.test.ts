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
  let anonymousSession: ClientSession;
  let project1Id: string;
  let paabHelper: PaabHelper;
  let adminSession: ClientSession;

  beforeAll(async () => {
    paabHelper = new PaabHelper(1);
    const paabResources = await paabHelper.createResources(__filename);
    project1Id = paabResources.project1Id;
    pa1Session = paabResources.pa1Session;
    pa2Session = paabResources.pa2Session;
    researcher1Sesssion = paabResources.rs1Session;
    adminSession = paabResources.adminSession;
    anonymousSession = paabResources.anonymousSession;
  });

  beforeEach(() => {
    expect.hasAssertions();
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('Validation error', () => {
    test('Missing parameters', async () => {
      try {
        await pa1Session.resources.projects.project(project1Id).dataSets().create({}, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message:
              'name: Required. storageName: Required. path: Required. awsAccountId: Required. region: Required. ' +
              'type: Invalid literal value, expected "internal"'
          })
        );
      }
    });

    test('Extra parameters', async () => {
      try {
        const createRequest = paabHelper.createDatasetRequest(project1Id);
        await pa1Session.resources.projects
          .project(project1Id)
          .dataSets()
          .create({ ...createRequest, ownerType: 'GROUP' }, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: ": Unrecognized key(s) in object: 'ownerType'"
          })
        );
      }
    });

    test('Duplicate creation', async () => {
      const createRequest = paabHelper.createDatasetRequest(project1Id);
      console.log(createRequest);
      await pa1Session.resources.projects.project(project1Id).dataSets().create(createRequest);
      console.log(createRequest);
      try {
        await pa1Session.resources.projects.project(project1Id).dataSets().create(createRequest);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(409, {
            error: 'Conflict',
            message:
              "Cannot create the DataSet. A DataSet must have a unique 'name', and the requested name already exists."
          })
        );
      }
    });

    test('Storage name not equal to main account S3 bucket name', async () => {
      const createRequest = paabHelper.createDatasetRequest(project1Id);
      try {
        await pa1Session.resources.projects
          .project(project1Id)
          .dataSets()
          .create({ ...createRequest, storageName: 'wrong-s3-bucket-name' }, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: "Please use data set S3 bucket name from main account for 'storageName'."
          })
        );
      }
    });

    test('Account number not equal to main account number', async () => {
      const createRequest = paabHelper.createDatasetRequest(project1Id);
      try {
        await pa1Session.resources.projects
          .project(project1Id)
          .dataSets()
          .create({ ...createRequest, awsAccountId: '123456789012' }, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: "Please use main account ID for 'awsAccountId'."
          })
        );
      }
    });

    test('Syntax error in parameters', async () => {
      try {
        await pa1Session.resources.projects.project(project1Id).dataSets().create(
          {
            storageName: 'illegal?bucket?name',
            awsAccountId: '1234',
            path: 'illegal?path', // using same name to help potential troubleshooting
            name: 'illegal?name',
            region: 'us-test-1',
            type: 'external'
          },
          false
        );
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message:
              'name: must contain only letters, numbers, hyphens, underscores, and periods. ' +
              'storageName: must contain only letters, numbers, hyphens, underscores, and periods. ' +
              'path: must contain only letters, numbers, hyphens, underscores, and periods. ' +
              'awsAccountId: must be a 12 digit number. ' +
              'region: must be valid AWS region. ' +
              'type: Invalid literal value, expected "internal"'
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
        await researcher1Sesssion.resources.projects
          .project(project1Id)
          .dataSets()
          .create(createRequest, false);
      } catch (actualError) {
        checkHttpError(actualError, expectedError);
      }
    });

    test('ProjectAdmins who belong to another project', async () => {
      try {
        const createRequest = paabHelper.createDatasetRequest(project1Id);
        await pa2Session.resources.projects.project(project1Id).dataSets().create(createRequest, false);
      } catch (actualError) {
        checkHttpError(actualError, expectedError);
      }
    });

    test('ITAdmins', async () => {
      try {
        const createRequest = paabHelper.createDatasetRequest(project1Id);
        await adminSession.resources.projects.project(project1Id).dataSets().create(createRequest, false);
      } catch (actualError) {
        console.log(JSON.stringify(actualError));
        console.log(JSON.stringify(expectedError));
        checkHttpError(actualError, expectedError);
      }
    });

    describe('user with no project', () => {
      beforeAll(async () => {
        //Remove researcher 1 from project 1 to make it a user with no project associated
        await adminSession.resources.projects
          .project(project1Id)
          .removeUserFromProject(researcher1Sesssion.getUserId()!);
      });
      afterAll(async () => {
        await adminSession.resources.projects
          .project(project1Id)
          .assignUserToProject(researcher1Sesssion.getUserId()!, {
            role: 'Researcher'
          });
      });

      test('User with no project cannot create datasets', async () => {
        try {
          const createRequest = paabHelper.createDatasetRequest(project1Id);
          await researcher1Sesssion.resources.projects
            .project(project1Id)
            .dataSets()
            .create(createRequest, false);
        } catch (actualError) {
          checkHttpError(actualError, expectedError);
        }
      });

      test('Unauthenticated user cannot create dataset', async () => {
        try {
          const createRequest = paabHelper.createDatasetRequest(project1Id);
          await anonymousSession.resources.projects
            .project(project1Id)
            .dataSets()
            .create(createRequest, false);
        } catch (actualError) {
          checkHttpError(actualError, new HttpError(403, {}));
        }
      });
    });
  });
});
