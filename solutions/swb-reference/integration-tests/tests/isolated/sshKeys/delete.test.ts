/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Delete Key Pair negative tests', () => {
  const paabHelper = new PaabHelper();
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let project1Id: string;
  let project2Id: string;
  let sshKeyId: string;

  beforeEach(async () => {
    ({ adminSession, pa1Session, rs1Session, project1Id, project2Id } = await paabHelper.createResources());
    expect.hasAssertions();
  });

  afterEach(async () => {
    await paabHelper.cleanup();
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
        await adminSession.resources.projects.project(project2Id).sshKeys().sshKey(existingSshKeyId).delete();
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
    const testBundle = [
      {
        userName: 'ProjectAdmin1',
        session: pa1Session,
        projectId: project1Id
      },
      {
        userName: 'researcher1',
        session: rs1Session,
        projectId: project1Id
      }
    ];

    testBundle.forEach(({ userName, session, projectId }) => {
      test(`it throws 404 error for ${userName}`, async () => {
        try {
          await session.resources.projects.project(projectId).sshKeys().sshKey(nonExistentSshKeyId).delete();
        } catch (e) {
          console.error(e);
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
});
