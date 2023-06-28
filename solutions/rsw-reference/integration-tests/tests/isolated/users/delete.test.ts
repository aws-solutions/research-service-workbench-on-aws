/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { Status, User } from '@aws/workbench-core-user-management';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('delete user negative tests', () => {
  const paabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    ({ adminSession, pa1Session, rs1Session, anonymousSession } = await paabHelper.createResources(
      __filename
    ));
  });

  afterAll(async () => {
    await paabHelper.cleanup();
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
          message: `Could not find user`
        })
      );
    }
  });

  test('active user cannot be deleted', async () => {
    let userId = '';
    try {
      const users = await adminSession.resources.users.get();
      const user: User = users.data.users.data.find((user: User) => user.status === Status.ACTIVE);

      expect(user).toBeDefined();

      userId = user.id;
      await adminSession.resources.users.user(userId).purge();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `Could not delete user. Expected status: ${Status[Status.INACTIVE]}; received: ${
            Status[Status.ACTIVE]
          }`
        })
      );
    }
  });

  test('ProjectAdmin: should return 403 error when delete a user', async () => {
    let userId = '';
    try {
      const users = await adminSession.resources.users.get();
      const user: User = users.data.users.data.find((user: User) => user.status === Status.ACTIVE);

      expect(user).toBeDefined();

      userId = user.id;
      await pa1Session.resources.users.user(userId).purge();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  test('Researcher: should return 403 error when delete a user', async () => {
    let userId = '';
    try {
      const users = await adminSession.resources.users.get();
      const user: User = users.data.users.data.find((user: User) => user.status === Status.ACTIVE);

      expect(user).toBeDefined();

      userId = user.id;
      await rs1Session.resources.users.user(userId).purge();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  test('Unauthenticated user: should return 403 error when delete a user', async () => {
    let userId = '';
    try {
      const users = await adminSession.resources.users.get();
      const user: User = users.data.users.data.find((user: User) => user.status === Status.ACTIVE);

      expect(user).toBeDefined();

      userId = user.id;
      await anonymousSession.resources.users.user(userId).purge();
    } catch (e) {
      checkHttpError(e, new HttpError(403, {}));
    }
  });
});
