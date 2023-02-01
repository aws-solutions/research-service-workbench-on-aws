/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list environment type configs associated to project', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const envTypeId = setup.getSettings().get('envTypeId');
  const projectId = setup.getSettings().get('projectId');
  const nonExistentProjectId = 'proj-12345678-1234-1234-1234-123456789012';
  const nonExistentEnvTypeId = 'et-prod-1234567890123,pa-1234567890123';

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('list projectEnvTypeConfigs excecutes successfully', async () => {
    const { data: response } = await adminSession.resources.projects
      .project(projectId)
      .environmentTypes()
      .environmentType(envTypeId)
      .configurations()
      .get({});
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('list projectEnvTypeConfigs fails when using invalid format project Id', async () => {
    try {
      await adminSession.resources.projects
        .project('invalid-project-id')
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .get({});
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          statusCode: 403,
          error: 'User is not authorized'
        })
      );
    }
  });

  test('list projectEnvTypeConfigs fails when using non existing project Id', async () => {
    try {
      await adminSession.resources.projects
        .project(nonExistentProjectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .get({});
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          statusCode: 404,
          error: 'Not Found',
          message: `Could not find project ${nonExistentProjectId}`
        })
      );
    }
  });

  test('list projectEnvTypeConfigs fails when using invalid format envType Id', async () => {
    try {
      await adminSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType('invalid-envType-id')
        .configurations()
        .get({});
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          statusCode: 403,
          error: 'User is not authorized'
        })
      );
    }
  });

  test('list projectEnvTypeConfigs fails when using non existing envType Id', async () => {
    try {
      await adminSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(nonExistentEnvTypeId)
        .configurations()
        .get({});
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          statusCode: 404,
          error: 'Not Found',
          message: `Could not find environment type ${nonExistentEnvTypeId}`
        })
      );
    }
  });
});
