/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('assign user to project negative tests', () => {
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

  describe('missing parameters', () => {
    const userId = '00000000-0000-0000-0000-000000000000';
    const projectId = `${resourceTypeToKey.project}-00000000-0000-0000-0000-000000000000`;
    test('role', async () => {
      try {
        await adminSession.resources.projects.project(projectId).assignUserToProject(userId, {});
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'Bad Request',
            message: "requires property 'role'"
          })
        );
      }
    });
  });

  test('user does not exist', async () => {
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    const projectId = `${resourceTypeToKey.project}-00000000-0000-0000-0000-000000000000`;
    try {
      await adminSession.resources.projects
        .project(projectId)
        .assignUserToProject(fakeUserId, { role: 'Researcher' });
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

  test('admin user cannot be assigned to a project', async () => {
    let adminUserId: string | undefined = '';
    const projectId = `${resourceTypeToKey.project}-00000000-0000-0000-0000-000000000000`;
    try {
      adminUserId = adminSession.getUserId();
      await adminSession.resources.projects
        .project(projectId)
        .assignUserToProject(adminUserId ?? '', { role: 'Researcher' });
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: `Admin ${adminUserId} cannot be assigned to the project ${projectId}`
        })
      );
    }
  });
});
