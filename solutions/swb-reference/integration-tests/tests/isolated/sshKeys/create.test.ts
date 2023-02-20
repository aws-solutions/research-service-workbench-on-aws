/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('cannot create SSH key', () => {
  const setup: Setup = new Setup();
  const paabHelper = new PaabHelper();
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let project1Id: string;

  beforeEach(async () => {
    ({ adminSession, pa1Session, rs1Session, project1Id } = await paabHelper.createResources());
    expect.hasAssertions();
  });

  afterEach(async () => {
    await setup.cleanup();
  });

  describe('when the user already has a key for that project', () => {
    let existingSshKeyId: string;

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

    describe.each(testBundle)('for each user', (testCase) => {
      const { username, session: sessionFunc } = testCase;
      let session: ClientSession;

      beforeEach(async () => {
        session = sessionFunc();
        const { data: existingSshKey } = await session.resources.projects
          .project(project1Id)
          .sshKeys()
          .create();
        existingSshKeyId = existingSshKey.id;
      });

      test(`it throws 400 error as ${username}`, async () => {
        try {
          await session.resources.projects.project(project1Id).sshKeys().create();
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `The keypair '${existingSshKeyId}' already exists.`
            })
          );
        }
      });
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
            error: 'Not Found',
            message: `Could not find project ${invalidProjectId}`
          })
        );
      }
    });
  });
});
