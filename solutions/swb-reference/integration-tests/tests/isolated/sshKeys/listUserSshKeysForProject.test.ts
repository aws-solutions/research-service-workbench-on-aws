/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('listUserSshKeysForProject negative tests', () => {
  const paabHelper = new PaabHelper();
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let project2: { id: string };

  beforeEach(async () => {
    ({ adminSession, pa1Session, project2 } = await paabHelper.createResources());
  });

  beforeEach(async () => {
    expect.hasAssertions();
  });

  afterEach(async () => {
    await paabHelper.cleanup();
  });

  describe('with User that is not authorized', () => {
    test.skip('it throws 403 error', async () => {
      try {
        const response = await pa1Session.resources.projects.project(project2.id).sshKeys().get();
        console.log('response', response);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized' //User does not have access
          })
        );
      }
    });
  });

  describe('with Project that does not exist', () => {
    test('it throws 404 error', async () => {
      const invalidProjectId = 'proj-00000000-0000-0000-0000-000000000000';
      try {
        await adminSession.resources.projects.project(invalidProjectId).sshKeys().get();
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
