/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';
import { checkHttpError } from '../../support/utils/utilities';

describe('multiStep user to project integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let costCenterId: string;

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();

    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: 'test cost center',
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });

    costCenterId = costCenter.id;
  });

  beforeEach(() => {
    expect.hasAssertions();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('Happy path', () => {
    test.each(['ProjectAdmin', 'Researcher'])('for role: %p', async (role: string) => {
      // create project
      const { data: project } = await adminSession.resources.projects.create({
        name: `TestProject-${uuidv4()}`,
        description: 'Project for happy path user to project API',
        costCenterId
      });

      // create user
      const { data: user } = await adminSession.resources.users.create({
        firstName: 'Project',
        lastName: role,
        email: `success+user-to-project-user-${uuidv4()}@simulator.amazonses.com`
      });

      // assign user to project
      await adminSession.resources.projects.project(project.id).assignUserToProject(user.id, { role });

      // list users by role
      const { data: users } = await adminSession.resources.projects
        .project(project.id)
        .listUsersForProject(role);

      expect(users.users).toEqual([
        expect.objectContaining({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        })
      ]);

      // remove users from project
      await adminSession.resources.projects.project(project.id).removeUserFromProject(user.id);

      // list users by role
      const { data: noUsers } = await adminSession.resources.projects
        .project(project.id)
        .listUsersForProject(role);

      expect(noUsers.users).toEqual([]);
    });
  });

  describe('negative tests', () => {
    test.each(['ProjectAdmin', 'Researcher'])(
      'cannot list users with role "%p" for deleted project',
      async (role: string) => {
        const { data: createdProject } = await adminSession.resources.projects.create({
          name: `TestProject-${uuidv4()}`,
          description: 'Project for negative integration tests',
          costCenterId
        });

        await adminSession.resources.projects.project(createdProject.id).softDelete();

        try {
          await adminSession.resources.projects.project(createdProject.id).listUsersForProject(role);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(404, {
              statusCode: 404,
              error: 'Not Found',
              message: `Could not find project ${createdProject.id}`
            })
          );
        }
      }
    );
  });
});
