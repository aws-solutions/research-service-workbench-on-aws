/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

describe('cannot create SSH key', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let project: { id: string };
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: randomTextGenerator.getFakeText('fakeCostCenterName'),
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });

    const { data } = await adminSession.resources.projects.create({
      name: randomTextGenerator.getFakeText('fakeProjectName'),
      description: 'Project for list users for project tests',
      costCenterId: costCenter.id
    });

    project = data;
  });

  beforeEach(async () => {
    expect.hasAssertions();
  });

  afterEach(async () => {
    await setup.cleanup();
  });

  describe('for a project when the user already has a key for that project', () => {
    let existingSshKeyId: string;

    beforeEach(async () => {
      const { data: existingSshKey } = await adminSession.resources.projects
        .project(project.id)
        .sshKeys()
        .create();
      existingSshKeyId = existingSshKey.sshKeyId;
    });

    test.skip('it throws 400 error', async () => {
      try {
        await adminSession.resources.projects.project(project.id).sshKeys().create();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'BadRequest',
            message: `The keypair '${existingSshKeyId}' already exists`
          })
        );
      }
    });
  });

  describe('for Project that does not exist', () => {
    let invalidProjectId: string;

    beforeEach(() => {
      invalidProjectId = 'proj-00000000-0000-0000-0000-000000000000';
    });

    test('it throws 404 error', async () => {
      try {
        await adminSession.resources.projects.project(invalidProjectId).sshKeys().create();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            statusCode: 404,
            error: 'Not Found',
            message: `Could not find project ${invalidProjectId}`
          })
        );
      }
    });
  });
});
