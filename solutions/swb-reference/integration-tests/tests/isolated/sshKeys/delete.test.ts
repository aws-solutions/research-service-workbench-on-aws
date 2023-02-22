/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Delete Key Pair negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let sshKeyId: string;
  let project: { id: string };
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  beforeEach(async () => {
    expect.hasAssertions();
    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: randomTextGenerator.getFakeText('fakeCostCenterName'),
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });

    const { data } = await adminSession.resources.projects.create({
      name: randomTextGenerator.getFakeText('fakeProjectName'),
      description: 'Project for Delete Key Pair negative tests',
      costCenterId: costCenter.id
    });

    project = data;
  });

  // TODO: multiple user session support has to exist for this test
  describe('when current user does not own key', () => {
    let existingSshKeyId: string;
    let secondaryUserId: string;

    beforeEach(async () => {
      // This needs to happen in not the defaultAdminSession so the default admin does not own this key
      // This user session must still have access to the project used
      // const {data: existingSshKey} = await adminSession.resources.projects.project(project.id).sshKeys().create();
      // secondaryUserId = adminSession.getUserId()!;
      // existingSshKeyId = existingSshKey.sshKeyId;
    });

    test.skip('it throws 403 error', async () => {
      try {
        await adminSession.resources.projects.project(project.id).sshKeys().sshKey(existingSshKeyId).delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'Forbidden',
            message: `Current user ${secondaryUserId} cannot delete a key they do not own`
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
            error: 'Not Found',
            message: `Could not find project ${invalidProjectId}`
          })
        );
      }
    });
  });

  describe('with SSH Key that does not exist', () => {
    let nonExistentSshKeyId: string;

    beforeEach(() => {
      nonExistentSshKeyId = `sshkey-0000000000000000000000000000000000000000000000000000000000000000`;
    });

    test('it throws 404 error', async () => {
      try {
        await adminSession.resources.projects
          .project(project.id)
          .sshKeys()
          .sshKey(nonExistentSshKeyId)
          .delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Key ${nonExistentSshKeyId} does not exist`
          })
        );
      }
    });
  });
});
