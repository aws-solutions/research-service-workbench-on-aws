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

  beforeAll(async () => {
    ({ adminSession, pa1Session, rs1Session, project1Id, project2Id } = await paabHelper.createResources());
    expect.hasAssertions();
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('when key does not exist', () => {
    let invalidSshKeyId: string;
    const testBundle = [
      {
        username: 'projectAdmin1',
        session: () => pa1Session,
        projectId: () => project1Id
      },
      {
        username: 'researcher1',
        session: () => rs1Session,
        projectId: () => project1Id
      }
    ];

    beforeEach(() => {
      invalidSshKeyId = `sshkey-0000000000000000000000000000000000000000000000000000000000000000`;
    });

    test.each(testBundle)('within a valid project', async (testCase) => {
      const { username, session: sessionFunc, projectId: projectIdFunc } = testCase;
      const session = sessionFunc();
      const projectId = projectIdFunc();

      console.log(`as ${username}`);

      try {
        await session.resources.projects.project(projectId).sshKeys().sshKey(invalidSshKeyId).delete();
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

  describe('for project that does not exist', () => {
    let invalidProjectId: string;
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
      invalidProjectId = 'proj-00000000-0000-0000-0000-000000000000';
      sshKeyId = `sshkey-0000000000000000000000000000000000000000000000000000000000000000`;
    });

    test.each(testBundle)('it throws 403 error', async (testCase) => {
      const { username, session: sessionFunc } = testCase;
      const session = sessionFunc();

      console.log(`as ${username}`);

      try {
        await session.resources.projects.project(invalidProjectId).sshKeys().sshKey(sshKeyId).delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });
  });

  describe('for project that user does not have access to', () => {
    const testBundle = [
      {
        username: 'projectAdmin1',
        session: () => pa1Session,
        projectId: () => project2Id
      },
      {
        username: 'researcher1',
        session: () => rs1Session,
        projectId: () => project2Id
      }
    ];

    beforeEach(() => {
      sshKeyId = `sshkey-0000000000000000000000000000000000000000000000000000000000000000`;
    });

    test.each(testBundle)('it throws 403 error', async (testCase) => {
      const { username, session: sessionFunc, projectId: projectIdFunc } = testCase;
      const session = sessionFunc();
      const projectId = projectIdFunc();

      console.log(`as ${username}`);

      try {
        await session.resources.projects.project(projectId).sshKeys().sshKey(sshKeyId).delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: `User is not authorized`
          })
        );
      }
    });
  });

  describe('with ITAdmin that cannot delete keys for a valid project', () => {
    const sampleSshKeyId: string = `sshkey-0000000000000000000000000000000000000000000000000000000000000000`;

    test('it throws 403 error', async () => {
      try {
        await adminSession.resources.projects.project(project1Id).sshKeys().sshKey(sampleSshKeyId).delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: `User is not authorized`
          })
        );
      }
    });
  });
});
