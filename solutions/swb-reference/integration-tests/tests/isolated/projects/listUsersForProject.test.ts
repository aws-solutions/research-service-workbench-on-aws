/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list users for project tests', () => {
  const paabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let pa2Session: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;
  let project1Id: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    ({ adminSession, pa1Session, project1Id, pa2Session, rs1Session, anonymousSession } =
      await paabHelper.createResources(__filename));
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
            message: `Could not find project`
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

    test('cannot have page size less than 1', async () => {
      try {
        await adminSession.resources.projects.project(project1Id).listUsersForProject('ProjectAdmin', 0);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `pageSize: Must be Between 1 and 60`
          })
        );
      }
    });

    test('cannot have page size greater than 60', async () => {
      try {
        await adminSession.resources.projects.project(project1Id).listUsersForProject('ProjectAdmin', 61);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `pageSize: Must be Between 1 and 60`
          })
        );
      }
    });

    test('cannot have invalid pagination token', async () => {
      try {
        await adminSession.resources.projects
          .project(project1Id)
          .listUsersForProject('ProjectAdmin', 1, 'invalidToken123');
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `Invalid parameter`
          })
        );
      }
    });

    test('ensure researcher cannot list ProjectAdmin users for projects', async () => {
      try {
        await rs1Session.resources.projects.project(project1Id).listUsersForProject('ProjectAdmin');
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('ensure researcher cannot list Researcher users for projects', async () => {
      try {
        await rs1Session.resources.projects.project(project1Id).listUsersForProject('Researcher');
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('ensure project admin cannot list users for other projects they are not project admin of', async () => {
      await pa1Session.resources.projects.project(project1Id).assignUserToProject(pa2Session.getUserId()!, {
        role: 'Researcher'
      });
      try {
        await pa2Session.resources.projects.project(project1Id).listUsersForProject('ProjectAdmin');
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
      await pa1Session.resources.projects.project(project1Id).removeUserFromProject(pa2Session.getUserId()!);
    });

    test('ensure project admin cannot list ProjectAdmin users for other projects they do not belong to', async () => {
      try {
        await pa2Session.resources.projects.project(project1Id).listUsersForProject('ProjectAdmin');
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('ensure project admin cannot list Researcher users for other projects they do not belong to', async () => {
      try {
        await pa2Session.resources.projects.project(project1Id).listUsersForProject('Reseacher');
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('ensure unauthenticated user cannot list users for projects', async () => {
      try {
        await anonymousSession.resources.projects.project(project1Id).listUsersForProject('ProjectAdmin');
      } catch (e) {
        checkHttpError(e, new HttpError(401, {}));
      }
    });
  });

  describe('basic tests', () => {
    let pageSize: number;
    let userIds: string[];

    // test IT Admin
    describe.each(['ProjectAdmin', 'Researcher'])('ITAdmin list users for role: %p', (role: string) => {
      beforeEach(async () => {
        pageSize = 1;

        await adminSession.resources.projects
          .project(project1Id)
          .assignUserToProject(pa2Session.getUserId()!, { role });

        userIds = [];
        userIds.push(pa1Session.getUserId()!);
        userIds.push(pa2Session.getUserId()!);
      });

      afterEach(async () => {
        await adminSession.resources.projects
          .project(project1Id)
          .removeUserFromProject(pa2Session.getUserId()!);
      });

      test('ITAdmin lists users for Role', async () => {
        let response = await adminSession.resources.projects.project(project1Id).listUsersForProject(role, 1);
        expect(response.status).toBe(200);

        let paginatedResponse = response.data;
        expect(paginatedResponse.data).toBeInstanceOf(Array);
        expect(paginatedResponse.data.length).toEqual(pageSize);
        expect(userIds.includes(paginatedResponse.data[0]));

        const paginationToken = response.data.paginationToken;
        expect(paginationToken.length).toBeGreaterThan(0);

        response = await adminSession.resources.projects
          .project(project1Id)
          .listUsersForProject(role, 1, paginationToken);
        expect(response.status).toBe(200);

        paginatedResponse = response.data;
        expect(paginatedResponse.data).toBeInstanceOf(Array);
        expect(paginatedResponse.data.length).toEqual(pageSize);
        expect(paginatedResponse.paginationToken).toBeUndefined();
        expect(userIds.includes(paginatedResponse.data[0]));
      });
    });

    // test Project Admin
    test.each(['ProjectAdmin', 'Researcher'])('PA list users for role: %p', async (role: string) => {
      const response = await pa1Session.resources.projects.project(project1Id).listUsersForProject(role, 1);
      expect(response.status).toBe(200);

      const paginatedResponse = response.data;
      expect(paginatedResponse.data).toBeInstanceOf(Array);
      expect(paginatedResponse.data.length).toEqual(pageSize);
      expect(userIds.includes(paginatedResponse.data[0]));
    });
  });
});
