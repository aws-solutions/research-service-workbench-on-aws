/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('remove user from project negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let project: { id: string };

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();

    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: 'test cost center',
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });

    const { data } = await adminSession.resources.projects.create({
      name: `TestProject-${uuidv4()}`,
      description: 'Project for list users for project tests',
      costCenterId: costCenter.id
    });

    project = data;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('user does not exist', async () => {
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    try {
      await adminSession.resources.projects.project(project.id).removeUserFromProject(fakeUserId);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          statusCode: 404,
          error: 'Not Found',
          message: `Could not find user ${fakeUserId}`
        })
      );
    }
  });

  test('project does not exist', async () => {
    let adminUserId: string | undefined = '';
    const projectId = `${resourceTypeToKey.project.toLowerCase()}-00000000-0000-0000-0000-000000000000`;
    try {
      adminUserId = adminSession.getUserId();
      await adminSession.resources.projects.project(projectId).removeUserFromProject(adminUserId ?? '');
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
});
