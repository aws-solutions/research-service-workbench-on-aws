/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '@aws/workbench-core-accounts/lib/models/projects/project';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError, generateRandomString, validSwbName } from '../../../support/utils/utilities';

describe('Update Project negative tests', () => {
  const paabHelper = new PaabHelper(2);
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  let existingProject: Project;
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));
  let costCenterId: string;
  let project1Id: string;
  let project2Id: string;

  beforeAll(async () => {
    ({ adminSession, pa1Session, rs1Session, anonymousSession, project1Id, project2Id } =
      await paabHelper.createResources(__filename));
  });

  afterAll(async () => {
    await paabHelper.cleanup();
    await setup.cleanup();
  });

  beforeEach(async () => {
    expect.hasAssertions();

    const projectName = randomTextGenerator.getFakeText('test-project-name');

    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: 'projectIntegrationTestCostCenter',
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });

    costCenterId = costCenter.id;

    const { data: project } = await adminSession.resources.projects.create({
      name: projectName,
      description: 'Update Project negative tests--Project for TOP SECRET dragon research',
      costCenterId: costCenter.id
    });

    existingProject = project;
  });

  describe('updating name to be same as existing project', () => {
    let project: Project;

    beforeEach(async () => {
      const { data: newProject } = await adminSession.resources.projects.create({
        name: generateRandomString(10, validSwbName),
        description: 'Update Project negative tests--Second Project',
        costCenterId: costCenterId
      });

      project = newProject;
    });

    test('it throws 400 error', async () => {
      try {
        await adminSession.resources.projects
          .project(project.id)
          .update({ name: existingProject.name }, true);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `Project name is in use by a non deleted project. Please use another name.`
          })
        );
      }
    });
  });

  test('Project Admin passing in project it does not belong to gets 403', async () => {
    try {
      await pa1Session.resources.projects.project(project2Id).update({}, true);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  test('Researcher gets 403', async () => {
    try {
      await rs1Session.resources.projects.project(project1Id).update({}, true);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  test('unauthenticated user gets 403', async () => {
    try {
      await anonymousSession.resources.projects.project(project1Id).update({}, true);
    } catch (e) {
      checkHttpError(e, new HttpError(403, {}));
    }
  });
});
