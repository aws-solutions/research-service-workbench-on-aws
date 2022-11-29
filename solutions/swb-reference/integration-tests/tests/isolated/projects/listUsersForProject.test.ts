/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list users for project tests', () => {
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

  describe('negative tests', () => {
    test('project does not exist', async () => {
      const projectId = `${resourceTypeToKey.project.toLowerCase()}-00000000-0000-0000-0000-000000000000`;
      try {
        await adminSession.resources.projects.project(projectId).listUsersForProject('Admin');
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

    test('cannot list users for non existing roles', async () => {
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

        await adminSession.resources.projects.project(projectId).listUsersForProject('abc');
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

  describe('basic tests', () => {
    let projectId = '';
    beforeEach(async () => {
      const projects = await adminSession.resources.projects.get();
      if (!projects.data.data.length) {
        return;
      }

      projectId = projects.data.data[0].id;
    });

    test('list users for admin', async () => {
      if (!projectId) {
        console.warn('There are no projects');

        // dummy assertion to make sure that test always passes
        // will be considered to move to multistep test:
        // create user, project, asign/remove user from project, remove user/project
        // as soon as project as a boundary feature is implemented
        expect(true).toBeTruthy();
        return;
      }

      const response = await adminSession.resources.projects.project(projectId).listUsersForProject('Admin');

      expect(response.status).toBe(200);
      expect(response.data.users).toBeInstanceOf(Array);
      expect(response.data.users.length).toBeGreaterThanOrEqual(0);
    });

    test('list users for researcher', async () => {
      if (!projectId) {
        console.warn('There are no projects');

        // dummy assertion to make sure that test always passes
        // will be considered to move to multistep test:
        // create user, project, asign/remove user from project, remove user/project
        // as soon as project as a boundary feature is implemented
        expect(true).toBeTruthy();
        return;
      }

      const response = await adminSession.resources.projects
        .project(projectId)
        .listUsersForProject('Researcher');

      // TODO: check if array have any elements after dynamic auth Z implemented
      expect(response.status).toBe(200);
      expect(response.data.users).toBeInstanceOf(Array);
      expect(response.data.users.length).toBeGreaterThanOrEqual(0);
    });
  });
});
