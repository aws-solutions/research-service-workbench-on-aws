/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Status } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

const fakeUuid = '00000000-0000-0000-0000-000000000000';
const invalidUuid = '12345';

describe('userManagement activate/deactivate user integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let userId: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();

    const { data } = await adminSession.resources.users.create({
      firstName: 'Test',
      lastName: 'User',
      email: `success+activate-deactivate-user-${uuidv4()}@simulator.amazonses.com`
    });
    userId = data.id;
  });

  afterAll(async () => {
    await setup.cleanup();
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
          statusCode: 404,
          error: 'Not Found',
          message: `Could not find user ${fakeUuid}`
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
          statusCode: 404,
          error: 'Not Found',
          message: `Could not find user ${fakeUuid}`
        })
      );
    }
  });

  it('should return a 403 error when deactivating a user with an invalid UUID', async () => {
    try {
      await adminSession.resources.users.user(invalidUuid).deactivate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  it('should return a 403 error when deactivating a user with an invalid UUID', async () => {
    try {
      await adminSession.resources.users.user(invalidUuid).deactivate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });
});
