/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '@aws/workbench-core-accounts/lib/models/projects/project';
import { afterEach } from 'jest-circus';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Update Project negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let existingProject: Project;
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));
  let costCenterId: string;

  beforeEach(async () => {
    expect.hasAssertions();

    adminSession = await setup.getDefaultAdminSession();
    const projectName = randomTextGenerator.getFakeText('test-project-name');

    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: 'project integration test cost center',
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });

    costCenterId = costCenter.id;

    const { data: project } = await adminSession.resources.projects.create({
      name: projectName,
      description: 'Project for TOP SECRET dragon research',
      costCenterId: costCenter.id
    });

    existingProject = project;
  });

  afterEach(async () => {
    await setup.cleanup();
  });

  describe('updating name to be same as existing project', () => {
    let project: Project;

    beforeEach(async () => {
      const { data: newProject } = await adminSession.resources.projects.create({
        name: randomTextGenerator.getFakeText('test-existing-name'),
        description: 'Project for TOP SECRET dragon research',
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
            statusCode: 400,
            error: 'Bad Request',
            message: `Project name "${existingProject.name}" is in use by a non deleted project. Please use another name.`
          })
        );
      }
    });
  });
});
