/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { Status, User } from '@aws/workbench-core-user-management';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('delete user negative tests', () => {
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

  test('user does not exist', async () => {
    const fakeUserId = '00000000-0000-0000-0000-000000000000';
    try {
      await adminSession.resources.users.user(fakeUserId).purge();
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

  test('active user cannot be deleted', async () => {
    let userId = '';
    try {
      const users = await adminSession.resources.users.get();
      const user: User = users.data.users.find((user: User) => user.status === Status.ACTIVE);

      expect(user).toBeDefined();

      userId = user.id;
      await adminSession.resources.users.user(userId).purge();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `Could not delete user ${userId}. Expected status: ${Status[Status.INACTIVE]}; received: ${
            Status[Status.ACTIVE]
          }`
        })
      );
    }
  });
});
