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
  const paabHelper = new PaabHelper(2);
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;
  let project1Id: string;
  let project2Id: string;
  const forbiddenHttpError = new HttpError(403, { error: 'User is not authorized' });

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    ({ adminSession, pa1Session, rs1Session, anonymousSession, project1Id, project2Id } =
      await paabHelper.createResources(__filename));
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
          message: `Could not find user`
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
          message: `Could not find project`
        })
      );
    }
  });

  test('Project Admin passing in project it does not belong to gets 403', async () => {
    try {
      await pa1Session.resources.projects
        .project(project2Id)
        .removeUserFromProject(rs1Session.getUserId() ?? '');
    } catch (e) {
      checkHttpError(e, forbiddenHttpError);
    }
  });

  test('Researcher gets 403', async () => {
    try {
      await rs1Session.resources.projects
        .project(project1Id)
        .removeUserFromProject(adminSession.getUserId() ?? '');
    } catch (e) {
      checkHttpError(e, forbiddenHttpError);
    }
  });

  test('unauthenticated user gets 403', async () => {
    try {
      await anonymousSession.resources.projects
        .project(project1Id)
        .removeUserFromProject(rs1Session.getUserId() ?? '');
    } catch (e) {
      checkHttpError(e, new HttpError(403, {}));
    }
  });
});
