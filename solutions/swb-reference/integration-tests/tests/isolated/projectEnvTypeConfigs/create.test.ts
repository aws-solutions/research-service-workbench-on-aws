/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Associate Project with EnvTypeConfig', () => {
  const setup: Setup = new Setup();
  const paabHelper: PaabHelper = new PaabHelper();
  let adminSession: ClientSession;
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
    const paabResources = await paabHelper.createResources();
    adminSession = paabResources.adminSession;
    projectId = paabResources.project1Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  test('fails when using invalid format project Id', async () => {
    try {
      await adminSession.resources.projects
        .project('invalid-project-id')
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .associate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
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
        .associate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find project ${nonExistentProjectId}`
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
        .associate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
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
        .associate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find environment type config ${envTypeConfigId}`
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
        .associate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
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
        .associate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find environment type config ${nonExistentEnvTypeConfigId}`
        })
      );
    }
  });
});
