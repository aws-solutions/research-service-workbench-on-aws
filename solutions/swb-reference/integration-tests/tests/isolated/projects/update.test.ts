/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '@aws/workbench-core-accounts/lib/models/projects/project';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Update Project negative tests', () => {
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  let existingProject: Project;
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));
  let costCenterId: string;

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  beforeEach(async () => {
    expect.hasAssertions();

    const projectName = randomTextGenerator.getFakeText('test-project-name');

    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: 'project integration test cost center',
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
        name: randomTextGenerator.getFakeText('test-existing-name'),
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
            message: `Project name "${existingProject.name}" is in use by a non deleted project. Please use another name.`
          })
        );
      }
    });
  });
});
