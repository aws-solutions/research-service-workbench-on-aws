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

describe('list users for project tests', () => {
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

  describe('negative tests', () => {
    test('project does not exist', async () => {
      const projectId = `${resourceTypeToKey.project.toLowerCase()}-00000000-0000-0000-0000-000000000000`;
      try {
        await adminSession.resources.projects.project(projectId).listUsersForProject('ProjectAdmin');
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

    test('cannot list users for non existing roles', async () => {
      try {
        await adminSession.resources.projects.project(project.id).listUsersForProject('abc');
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            statusCode: 403,
            error: 'User is not authorized'
          })
        );
      }
    });
  });

  describe('basic tests', () => {
    test.each(['ProjectAdmin', 'Researcher'])('list users for role: %p', async (role: string) => {
      const response = await adminSession.resources.projects.project(project.id).listUsersForProject(role);

      expect(response.status).toBe(200);
      expect(response.data.users).toBeInstanceOf(Array);
      expect(response.data.users.length).toBeGreaterThanOrEqual(0);
    });
  });
});
