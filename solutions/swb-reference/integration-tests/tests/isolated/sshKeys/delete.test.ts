/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Delete Key Pair negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let currentUser: string | undefined;
  let sshKeyId: string;
  let project: { id: string };

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

  beforeEach(async () => {
    currentUser = adminSession.getUserId();
    expect.hasAssertions();
  });

  afterEach(async () => {
    await setup.cleanup();
  });

  // TODO: key has to exist for this test
  describe('when current user does not own key', () => {
    beforeEach(() => {
      currentUser = 'user-00000000-0000-0000-0000-000000000000';
      sshKeyId = `sshkey-`;
    });

    test.skip('it throws 403 error', async () => {
      try {
        await adminSession.resources.projects.project(project.id).sshKeys().sshKey(sshKeyId).delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            statusCode: 403,
            error: 'Forbidden',
            message: `Current user ${currentUser} cannot delete a key they do not own`
          })
        );
      }
    });
  });

  describe('with Project that does not exist', () => {
    let invalidProjectId: string;

    beforeEach(() => {
      invalidProjectId = 'proj-00000000-0000-0000-0000-000000000000';
      sshKeyId = `sshkey-0000000000000000000000000000000000000000000000000000000000000000`;
    });

    test('it throws 404 error', async () => {
      try {
        await adminSession.resources.projects.project(invalidProjectId).sshKeys().sshKey(sshKeyId).delete();
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

  describe('with SSH Key that does not exist', () => {
    beforeEach(() => {
      sshKeyId = `sshkey-0000000000000000000000000000000000000000000000000000000000000000`;
    });

    test('it throws 404 error', async () => {
      try {
        await adminSession.resources.projects.project(project.id).sshKeys().sshKey(sshKeyId).delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            statusCode: 404,
            error: 'Not Found',
            message: `Key ${sshKeyId} does not exist`
          })
        );
      }
    });
  });
});
