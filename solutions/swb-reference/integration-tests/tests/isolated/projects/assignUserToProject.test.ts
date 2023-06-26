/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { User } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('assign user to project negative tests', () => {
  const paabHelper = new PaabHelper(2);
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;
  let project1Id: string;
  let project2Id: string;
  const forbiddenHttpError = new HttpError(403, { error: 'User is not authorized' });

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    ({ adminSession, pa1Session, rs1Session, anonymousSession, project1Id, project2Id } =
      await paabHelper.createResources(__filename));
  });

  afterAll(async () => {
    await paabHelper.cleanup();
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
          error: 'Not Found',
          message: `Could not find user`
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
          error: 'Bad Request',
          message: `IT Admin cannot be assigned to the project`
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
        email: `success+user-${uuidv4()}@simulator.amazonses.com`
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
            error: 'Not Found',
            message: `Could not find project`
          })
        );
      }
    });

    test('cannot assign user to the same project', async () => {
      const response = await adminSession.resources.projects
        .project(project1Id)
        .assignUserToProject(userId ?? '', { role: 'Researcher' });

      expect(response.status).toBe(204);

      // expect subsequent call to fail
      try {
        await adminSession.resources.projects
          .project(project1Id)
          .assignUserToProject(userId ?? '', { role: 'Researcher' });

        // if we are here - expectation is not fulfilled
        console.error(`Assigning user ${userId} to the same project ${project1Id} did not cause error`);
        expect(false).toBeTruthy();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `User is already assigned to the project`
          })
        );
      }
    });

    test('Project Admin passing in project it does not belong to gets 403', async () => {
      try {
        await pa1Session.resources.projects
          .project(project2Id)
          .assignUserToProject(userId ?? rs1Session.getUserId, { role: 'Researcher' });
      } catch (e) {
        checkHttpError(e, forbiddenHttpError);
      }
    });

    test('Researcher gets 403', async () => {
      try {
        await rs1Session.resources.projects
          .project(project1Id)
          .assignUserToProject(userId ?? '', { role: 'Researcher' });
      } catch (e) {
        checkHttpError(e, forbiddenHttpError);
      }
    });

    test('Unauthenticated user gets 403', async () => {
      try {
        await anonymousSession.resources.projects
          .project(project1Id)
          .assignUserToProject(userId ?? rs1Session.getUserId, { role: 'Researcher' });
      } catch (e) {
        checkHttpError(e, new HttpError(403, {}));
      }
    });
  });
});
