/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Get EnvTypeConfig with Project route', () => {
  const paabHelper: PaabHelper = new PaabHelper(2);
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;
  const envTypeId = setup.getSettings().get('envTypeId');
  const envTypeConfigId = setup.getSettings().get('envTypeConfigId');
  const nonExistentProjectId = 'proj-12345678-1234-1234-1234-123456789012';
  const nonExistentEnvTypeId = 'et-prod-0123456789012,pa-0123456789012';
  const nonExistentEnvTypeConfigId = 'etc-12345678-1234-1234-1234-123456789012';
  let project1Id: string;
  let project2Id: string;

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
    project2Id = paabResources.project2Id;

    await adminSession.resources.projects
      .project(project2Id)
      .environmentTypes()
      .environmentType(envTypeId)
      .configurations()
      .environmentTypeConfig(envTypeConfigId)
      .associate();
  });

  afterAll(async () => {
    await adminSession.resources.projects
      .project(project2Id)
      .environmentTypes()
      .environmentType(envTypeId)
      .configurations()
      .environmentTypeConfig(envTypeConfigId)
      .disassociate();
    await paabHelper.cleanup();
  });

  describe('IT Admin tests', () => {
    test('fails when using invalid format project Id', async () => {
      try {
        await adminSession.resources.projects
          .project('invalid-project-id')
          .environmentTypes()
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `projectId: Invalid ID`
          })
        );
      }
    });

    test('fails when using non existing project Id', async () => {
      try {
        await adminSession.resources.projects
          .project(nonExistentProjectId)
          .environmentTypes()
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: 'Resource not found'
          })
        );
      }
    });

    test('fails when using invalid format envType Id', async () => {
      try {
        await adminSession.resources.projects
          .project(project1Id)
          .environmentTypes()
          .environmentType('invalid-envType-id')
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `envTypeId: Invalid ID`
          })
        );
      }
    });

    test('fails when using non existing envType Id', async () => {
      try {
        await adminSession.resources.projects
          .project(project1Id)
          .environmentTypes()
          .environmentType(nonExistentEnvTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: 'Resource not found'
          })
        );
      }
    });

    test('fails when using invalid format envTypeConfig Id', async () => {
      try {
        await adminSession.resources.projects
          .project(project1Id)
          .environmentTypes()
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig('invalid-etc-id')
          .get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `envTypeConfigId: Invalid ID`
          })
        );
      }
    });

    test('fails when using non existing envTypeConfig Id', async () => {
      try {
        await adminSession.resources.projects
          .project(project1Id)
          .environmentTypes()
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(nonExistentEnvTypeConfigId)
          .get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: 'Resource not found'
          })
        );
      }
    });
  });

  describe('Researcher test', () => {
    test('cannot get ETC for project where researcher is not a part of the project', async () => {
      try {
        await researcherSession.resources.projects
          .project(project2Id)
          .environmentTypes()
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .get();
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

  describe('Project Admin test', () => {
    test('cannot get ETC for project where Project Admin is not a part of the project', async () => {
      try {
        await pa1Session.resources.projects
          .project(project2Id)
          .environmentTypes()
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .get();
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

  test('Unauthenticated user cannot get ETC', async () => {
    try {
      await anonymousSession.resources.projects
        .project(project2Id)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .get();
    } catch (e) {
      checkHttpError(e, new HttpError(401, {}));
    }
  });
});
