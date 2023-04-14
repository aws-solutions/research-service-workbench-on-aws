/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import { PaabHelper } from '../../support/complex/paabHelper';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';
import { checkHttpError } from '../../support/utils/utilities';

describe('multiStep user to project integration test', () => {
  const setup: Setup = Setup.getSetup();
  const paabHelper = new PaabHelper();
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let project1Id: string;
  let costCenterId: string;

  beforeAll(async () => {
    ({ adminSession, pa1Session, project1Id } = await paabHelper.createResources());

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
    await paabHelper.cleanup();
    await setup.cleanup();
  });

  describe('Happy path for ITAdmin', () => {
    test.each(['ProjectAdmin', 'Researcher'])('for role: %p', async (role: string) => {
      // create user
      console.log('ITAdmin creating a user...');
      const mockUserInput = {
        firstName: 'mockUser',
        lastName: role,
        email: `success+user-to-project-user-${uuidv4()}@simulator.amazonses.com`
      };
      const { data: mockUser } = await adminSession.resources.users.create(mockUserInput);
      const mockUserId = mockUser.id;

      // assign user to project
      console.log(`ITAdmin assigning user ${mockUserId} to project ${project1Id}...`);
      await adminSession.resources.projects.project(project1Id).assignUserToProject(mockUserId, { role });

      // list users by role
      console.log(`ITAdmin listing user ${mockUserId} to project ${project1Id}...`);
      const { data: usersByITAdmin } = await adminSession.resources.projects
        .project(project1Id)
        .listUsersForProject(role);

      expect(usersByITAdmin.users).toContainEqual(expect.objectContaining({ id: mockUserId }));

      // remove mock user from project
      console.log(`Removing user ${mockUserId} from project ${project1Id}...`);
      await adminSession.resources.projects.project(project1Id).removeUserFromProject(mockUserId);

      // list users by role
      console.log(`retrieving user ${mockUserId} from project ${project1Id} should not return user`);
      const { data: updatedUsersByITAdmin } = await adminSession.resources.projects
        .project(project1Id)
        .listUsersForProject(role);

      expect(updatedUsersByITAdmin.users).not.toContainEqual(expect.objectContaining({ id: mockUserId }));
    });
  });

  describe('Happy path for ProjectAdmin', () => {
    test.each(['ProjectAdmin', 'Researcher'])('for role: %p', async (role: string) => {
      // create user by ITAdmin, not PA
      console.log('IT Admin creating a user...');
      const mockUserInput = {
        firstName: 'mockUser',
        lastName: role,
        email: `success+user-to-project-user-${uuidv4()}@simulator.amazonses.com`
      };
      const { data: mockUser } = await adminSession.resources.users.create(mockUserInput);
      const mockUserId = mockUser.id;

      // assign user to project
      console.log(`Project Admin assigning user ${mockUserId} to project ${project1Id}...`);
      await pa1Session.resources.projects.project(project1Id).assignUserToProject(mockUserId, { role });

      // list users by role
      console.log(`Project Admin listing user ${mockUserId} to project ${project1Id}...`);
      const { data: usersByPA } = await pa1Session.resources.projects
        .project(project1Id)
        .listUsersForProject(role);
      const { data: usersByITAdmin } = await adminSession.resources.projects
        .project(project1Id)
        .listUsersForProject(role);

      expect(usersByPA).toEqual(usersByITAdmin);
      expect(usersByPA.users).toContainEqual(expect.objectContaining({ id: mockUserId }));

      // remove users from project
      console.log(`Project Admin removing user ${mockUserId} from project ${project1Id}...`);
      await pa1Session.resources.projects.project(project1Id).removeUserFromProject(mockUserId);

      // list users by role
      const { data: updatedUsersByPA } = await pa1Session.resources.projects
        .project(project1Id)
        .listUsersForProject(role);

      expect(updatedUsersByPA.users).not.toContainEqual(expect.objectContaining({ id: mockUserId }));
    });
  });

  describe('negative tests', () => {
    test.each(['ProjectAdmin', 'Researcher'])(
      'cannot list users with role "%p" for deleted project',
      async (role: string) => {
        console.log('Creating project...');
        const { data: createdProject } = await adminSession.resources.projects.create({
          name: `TestProject-${uuidv4()}`,
          description: 'Project for negative integration tests',
          costCenterId
        });

        await adminSession.resources.projects.project(createdProject.id).delete();

        try {
          console.log(`Expecting failed attempt to list users for deleted project ${createdProject.id}`);
          await adminSession.resources.projects.project(createdProject.id).listUsersForProject(role);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(404, {
              error: 'Not Found',
              message: `Could not find project ${createdProject.id}`
            })
          );
        }
      }
    );
  });
});
