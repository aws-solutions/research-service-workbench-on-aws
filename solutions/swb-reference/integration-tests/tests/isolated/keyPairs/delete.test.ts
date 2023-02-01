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

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('with Project that does not exist', () => {
    const invalidProjectId = 'proj-00000000-0000-0000-0000-000000000000';

    test('it throws 404 error', async () => {
      try {
        await adminSession.resources.projects
          .project(invalidProjectId)
          .keyPairs()
          .keyPair(invalidProjectId)
          .delete();
        // await adminSession.resources.projects.project(invalidProjectId).softDelete();
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
  // TODO add negative test for when there is no unique key--need create to set up situation
});
