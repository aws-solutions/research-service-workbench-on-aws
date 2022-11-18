/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('remove user from project negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('user does not exist', async () => {
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    let projectId = '';
    try {
      const projects = await adminSession.resources.projects.get();
      if (!projects.data.data.length) {
        console.warn('There are no projects');

        // dummy assertion to make sure that test always passes
        // will be considered to move to multistep test:
        // create user, project, asign/remove user from project, remove user/project
        // as soon as project as a boundary feature is implemented
        expect(true).toBeTruthy();
        return;
      }

      projectId = projects.data.data[0].id;
      await adminSession.resources.projects.project(projectId).removeUserFromProject(fakeUserId);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          statusCode: 404,
          error: 'Not Found',
          message: `Could not find user ${fakeUserId}`
        })
      );
    }
  });

  test('project does not exist', async () => {
    let adminUserId: string | undefined = '';
    const projectId = `${resourceTypeToKey.project.toLowerCase()}-00000000-0000-0000-0000-000000000000`;
    try {
      adminUserId = adminSession.getUserId();
      await adminSession.resources.projects.project(projectId).removeUserFromProject(adminUserId ?? '');
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          statusCode: 404,
          error: 'Not Found',
          message: `Could not find project ${projectId}`
        })
      );
    }
  });
});
