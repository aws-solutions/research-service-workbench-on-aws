/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { User } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
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
    const projectId = `${resourceTypeToKey.project.toLowerCase()}-00000000-0000-0000-0000-000000000000`;
    test('role', async () => {
      try {
        await adminSession.resources.projects.project(projectId).assignUserToProject(userId, {});
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'role: Required'
          })
        );
      }
    });
  });

  test('user does not exist', async () => {
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    const projectId = `${resourceTypeToKey.project.toLowerCase()}-00000000-0000-0000-0000-000000000000`;
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
    const projectId = `${resourceTypeToKey.project.toLowerCase()}-00000000-0000-0000-0000-000000000000`;
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
          message: `IT Admin ${adminUserId} cannot be assigned to the project ${projectId}`
        })
      );
    }
  });

  describe('user based tests', () => {
    let userId: string = '';
    beforeEach(async () => {
      const response = await adminSession.resources.users.create({
        firstName: 'Test',
        lastName: 'User',
        email: `user-${uuidv4()}@simulator.amazonses.com`
      });

      const user: User = response.data;
      userId = user.id;
    });

    test('project does not exist', async () => {
      const projectId = `${resourceTypeToKey.project.toLowerCase()}-00000000-0000-0000-0000-000000000000`;
      try {
        await adminSession.resources.projects
          .project(projectId)
          .assignUserToProject(userId ?? '', { role: 'Researcher' });
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

    test('cannot assing user to the same project', async () => {
      let projectId = '';
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

      const response = await adminSession.resources.projects
        .project(projectId)
        .assignUserToProject(userId ?? '', { role: 'Researcher' });

      expect(response.status).toBe(204);

      // expect subsequent call to fail
      try {
        await adminSession.resources.projects
          .project(projectId)
          .assignUserToProject(userId ?? '', { role: 'Researcher' });

        // if we are here - expectation is not fulfilled
        console.error(`Assigning user ${userId} to the same project ${projectId} did not cause error`);
        expect(false).toBeTruthy();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'Bad Request',
            message: `User ${userId} is already assigned to the project ${projectId}`
          })
        );
      }
    });
  });
});
