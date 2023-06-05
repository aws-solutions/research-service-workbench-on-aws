/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/swb-app';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list users for project tests', () => {
  const paabHelper = new PaabHelper();
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let project1Id: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    ({ adminSession, pa1Session, project1Id } = await paabHelper.createResources());
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('negative tests', () => {
    test('project does not exist', async () => {
      const projectId = `${resourceTypeToKey.project.toLowerCase()}-00000000-0000-0000-0000-000000000000`;
      try {
        await adminSession.resources.projects.project(projectId).listUsersForProject('ProjectAdmin');
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Could not find project ${projectId}`
          })
        );
      }
    });

    test('cannot list users for non existing roles', async () => {
      try {
        await adminSession.resources.projects.project(project1Id).listUsersForProject('abc');
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `role: Invalid enum value. Expected 'ProjectAdmin' | 'Researcher', received 'abc'`
          })
        );
      }
    });
  });

  describe('basic tests', () => {
    // test IT Admin
    test.each(['ProjectAdmin', 'Researcher'])('ITAdmin list users for role: %p', async (role: string) => {
      const response = await adminSession.resources.projects.project(project1Id).listUsersForProject(role);

      expect(response.status).toBe(200);
      expect(response.data.users).toBeInstanceOf(Array);
      expect(response.data.users.length).toBeGreaterThanOrEqual(0);
    });

    // test Project Admin
    test.each(['ProjectAdmin', 'Researcher'])('PA list users for role: %p', async (role: string) => {
      const response = await pa1Session.resources.projects.project(project1Id).listUsersForProject(role);

      expect(response.status).toBe(200);
      expect(response.data.users).toBeInstanceOf(Array);
      expect(response.data.users.length).toBeGreaterThanOrEqual(0);
    });
  });
});
