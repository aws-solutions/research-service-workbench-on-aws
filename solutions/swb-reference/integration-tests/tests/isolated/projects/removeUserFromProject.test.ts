/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('remove user from project negative tests', () => {
  const paabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  let project1Id: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    ({ adminSession, project1Id } = await paabHelper.createResources(__filename));
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  test('user does not exist', async () => {
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    try {
      await adminSession.resources.projects.project(project1Id).removeUserFromProject(fakeUserId);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find user ${fakeUserId}`
        })
      );
    }
  });

  test('project does not exist', async () => {
    let adminUserId: string | undefined = '';
    const projectId = `${resourceTypeToKey.project.toLowerCase()}-00000000-0000-0000-0000-000000000000`;
    try {
      adminUserId = adminSession.getUserId();
      await adminSession.resources.projects.project(projectId).removeUserFromProject(adminUserId ?? '');
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find project ${projectId}`
        })
      );
    }
  });
});
