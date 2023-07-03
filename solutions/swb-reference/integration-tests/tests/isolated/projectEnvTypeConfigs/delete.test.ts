/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Disassociate Project with EnvTypeConfig', () => {
  const paabHelper: PaabHelper = new PaabHelper(1);
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;
  const envTypeId = setup.getSettings().get('envTypeId');
  const envTypeConfigId = setup.getSettings().get('envTypeConfigId');
  const nonExistentProjectId = 'proj-12345678-1234-1234-1234-123456789012';
  const nonExistentEnvTypeId = 'et-prod-0123456789012,pa-0123456789012';
  const nonExistentEnvTypeConfigId = 'etc-12345678-1234-1234-1234-123456789012';
  let projectId: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    adminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
    projectId = paabResources.project1Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  test('Project Admin cannot disassociate project with ETC', async () => {
    try {
      await paSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .disassociate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  test('Researcher cannot disassociate project with ETC', async () => {
    try {
      await researcherSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .disassociate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  test('Unauthenticated user cannot disassociate project with ETC', async () => {
    try {
      await anonymousSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .disassociate();
    } catch (e) {
      checkHttpError(e, new HttpError(403, {}));
    }
  });

  test('fails when using invalid format project Id', async () => {
    try {
      await adminSession.resources.projects
        .project('invalid-project-id')
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .disassociate();
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
        .disassociate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find project`
        })
      );
    }
  });

  test('fails when using invalid format envType Id', async () => {
    try {
      await adminSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType('invalid-envType-id')
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .disassociate();
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
        .project(projectId)
        .environmentTypes()
        .environmentType(nonExistentEnvTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .disassociate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find environment type config`
        })
      );
    }
  });

  test('fails when using invalid format envTypeConfig Id', async () => {
    try {
      await adminSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig('invalid-etc-id')
        .disassociate();
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
        .project(projectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(nonExistentEnvTypeConfigId)
        .disassociate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find environment type config`
        })
      );
    }
  });
});
