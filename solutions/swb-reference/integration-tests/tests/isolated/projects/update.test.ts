/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Update Project negative tests', () => {
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

  describe('updating name to be same as existing project', () => {
    const existingProjectName = setup.getSettings().get('projectName');
    const projectId = setup.getSettings().get('projectId');

    test('it throws 400 error', async () => {
      try {
        await adminSession.resources.projects.project(projectId).update({ name: existingProjectName }, true);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'Bad Request',
            message: `Project name "${existingProjectName}" is in use by a non deleted project. Please use another name.`
          })
        );
      }
    });
  });
});
