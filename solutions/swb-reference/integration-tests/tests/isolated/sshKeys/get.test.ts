/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Get Key Pair negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let adminUserId: string | undefined;
  let project: { id: string };

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    adminUserId = adminSession.getUserId();
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

  beforeEach(async () => {
    expect.hasAssertions();
  });

  afterEach(async () => {
    await setup.cleanup();
  });

  describe('with User that is not authorized', () => {
    let invalidUserId: string;
    beforeEach(() => {
      invalidUserId = '00000000-0000-0000-0000-000000000000';
    });
    test.skip('it throws 403 error', async () => {
      try {
        //TODO:
        // get auth :await adminSession.resources.projects.project(project.id).get()
      } catch (e) {
        // console.error(e)
        checkHttpError(
          e,
          new HttpError(403, {
            statusCode: 403,
            error: 'User is not authorized', //User does not have access
            message: ` ${invalidUserId} for project ${project.id}` //TODO
          })
        );
      }
    });
  });

  describe('with Project that does not exist', () => {
    let invalidProjectId: string;

    beforeEach(() => {
      invalidProjectId = 'proj-00000000-0000-0000-0000-000000000000';
    });
    test('it throws 404 error', async () => {
      try {
        await adminSession.resources.projects.project(invalidProjectId).sshKeys().get();
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
