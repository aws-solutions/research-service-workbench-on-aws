/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import Settings from '../../../support/utils/settings';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Associate Project with EnvTypeConfig', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const settings: Settings = setup.getSettings();
  const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
  const envTypeId = setup.getSettings().get('envTypeId');
  const projectId = setup.getSettings().get('projectId');
  const envTypeConfigId = setup.getSettings().get('envTypeConfigId');
  const nonExistentProjectId = 'proj-12345678-1234-1234-1234-123456789012';
  const nonExistentEnvTypeId = 'et-prod-0123456789012,pa-0123456789012';
  const nonExistentEnvTypeConfigId = 'etc-12345678-1234-1234-1234-123456789012';

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
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

  test('fails when using deleted project', async () => {
    const dataSetName = randomTextGenerator.getFakeText('integration-test-dataSet');

    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: `${dataSetName} cost center`,
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });

    const { data: createdProject } = await adminSession.resources.projects.create({
      name: `${dataSetName} project`,
      description: 'test description',
      costCenterId: costCenter.id
    });

    const projectId = createdProject.id;

    await adminSession.resources.projects.project(projectId).delete();

    try {
      await adminSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .associate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `Project ${projectId} was deleted`
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
