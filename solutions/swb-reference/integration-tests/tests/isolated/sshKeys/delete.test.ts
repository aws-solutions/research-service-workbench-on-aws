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
  let sshKeyId: string;

  beforeEach(async () => {
    ({ adminSession, pa1Session, rs1Session, project1Id } = await paabHelper.createResources());
    expect.hasAssertions();
  });

  afterEach(async () => {
    await paabHelper.cleanup();
  });

  describe('when key does not exist', () => {
    let invalidSshKeyId: string;
    const testBundle = [
      {
        username: 'projectAdmin1',
        session: () => pa1Session
      },
      {
        username: 'researcher1',
        session: () => rs1Session
      }
    ];

    beforeEach(() => {
      invalidSshKeyId = `sshkey-0000000000000000000000000000000000000000000000000000000000000000`;
    });

    test.each(testBundle)('within a valid project', async (testCase) => {
      const { username, session: sessionFunc } = testCase;
      const session = sessionFunc();

      console.log(`as ${username}`);

      try {
        await session.resources.projects.project(project1Id).sshKeys().sshKey(invalidSshKeyId).delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Key ${invalidSshKeyId} does not exist`
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
});
