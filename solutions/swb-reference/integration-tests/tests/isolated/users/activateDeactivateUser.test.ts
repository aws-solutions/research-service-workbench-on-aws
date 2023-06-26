/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Status, User } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

const fakeUuid = '00000000-0000-0000-0000-000000000000';
const invalidUuid = '12345';

describe('userManagement activate/deactivate user integration test', () => {
  const paabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;
  let userId: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    ({ adminSession, pa1Session, rs1Session, anonymousSession } = await paabHelper.createResources(
      __filename
    ));

    const { data } = await adminSession.resources.users.create({
      firstName: 'Test',
      lastName: 'User',
      email: `success+activate-deactivate-user-${uuidv4()}@simulator.amazonses.com`
    });
    userId = data.id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  it('should be able to activate an inactive user', async () => {
    await adminSession.resources.users.user(userId).deactivate();
    await adminSession.resources.users.user(userId).activate();

    const { data: activeUser } = await adminSession.resources.users.user(userId).get();

    expect(activeUser).toMatchObject({
      status: Status.ACTIVE
    });
  });

  it('should be able to deactivate an active user', async () => {
    await adminSession.resources.users.user(userId).activate();
    await adminSession.resources.users.user(userId).deactivate();

    const { data: inactiveUser } = await adminSession.resources.users.user(userId).get();

    expect(inactiveUser).toMatchObject({
      status: Status.INACTIVE
    });
  });

  it('should do nothing when a user is already active', async () => {
    await adminSession.resources.users.user(userId).activate();
    await adminSession.resources.users.user(userId).activate();

    const { data: activeUser } = await adminSession.resources.users.user(userId).get();

    expect(activeUser).toMatchObject({
      status: Status.ACTIVE
    });
  });

  it('should do nothing when a user is already inactive', async () => {
    await adminSession.resources.users.user(userId).deactivate();
    await adminSession.resources.users.user(userId).deactivate();

    const { data: activeUser } = await adminSession.resources.users.user(userId).get();

    expect(activeUser).toMatchObject({
      status: Status.INACTIVE
    });
  });

  it('should return a 404 error when activating a user that doesnt exist', async () => {
    try {
      await adminSession.resources.users.user(fakeUuid).activate();
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

  it('should return a 404 error when deactivating a user that doesnt exist', async () => {
    try {
      await adminSession.resources.users.user(fakeUuid).deactivate();
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

  it('should return an error when deactivating a user with an invalid UUID', async () => {
    try {
      await adminSession.resources.users.user(invalidUuid).deactivate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: 'userId: Invalid ID'
        })
      );
    }
  });

  describe('Unauthorized tests', () => {
    beforeEach(async () => {
      const users = await adminSession.resources.users.get();
      const user = users.data.users.data.find((user: User) => user.status === Status.ACTIVE);

      expect(user).toBeDefined();

      userId = user.id;
    });

    it('ProjectAdmin: should return 403 error when try to activate a user', async () => {
      try {
        await pa1Session.resources.users.user(userId).activate();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    it('Researcher: should return 403 error when try to activate a user', async () => {
      try {
        await rs1Session.resources.users.user(userId).activate();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    it('Unauthenticated user: should return 403 error when try to activate a user', async () => {
      try {
        await anonymousSession.resources.users.user(userId).activate();
      } catch (e) {
        checkHttpError(e, new HttpError(403, {}));
      }
    });

    it('ProjectAdmin: should return 403 error when try to deactivate a user', async () => {
      try {
        await pa1Session.resources.users.user(userId).deactivate();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    it('Researcher: should return 403 error when try to deactivate a user', async () => {
      try {
        await rs1Session.resources.users.user(userId).deactivate();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    it('Unauthenticated user: should return 403 error when try to deactivate a user', async () => {
      try {
        await anonymousSession.resources.users.user(userId).deactivate();
      } catch (e) {
        checkHttpError(e, new HttpError(403, {}));
      }
    });
  });
});
