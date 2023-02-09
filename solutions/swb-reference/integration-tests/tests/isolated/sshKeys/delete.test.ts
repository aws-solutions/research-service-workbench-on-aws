/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Delete Key Pair negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeEach(async () => {
    adminSession = await setup.getDefaultAdminSession();
    expect.hasAssertions();
  });

  afterEach(async () => {
    await setup.cleanup();
  });

  describe('with Project that does not exist', () => {
    const invalidProjectId = 'proj-00000000-0000-0000-0000-000000000000';

    test.skip('it throws 404 error', async () => {
      try {
        // await adminSession.resources.projects.project(invalidProjectId).sshKeys().delete();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            statusCode: 404,
            error: 'Not Found',
            message: `No key exists for user ${adminSession.getUserId()} and project ${invalidProjectId}`
          })
        );
      }
    });
  });
});