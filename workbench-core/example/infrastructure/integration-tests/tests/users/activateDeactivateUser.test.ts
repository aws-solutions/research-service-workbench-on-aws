/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Status } from '@aws/workbench-core-authentication';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';
import { checkHttpError } from '../../support/utils/utilities';

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
      email: 'activatedeactivate@user.com'
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

  it('should return an error when activating a user that doesnt exist', async () => {
    try {
      await adminSession.resources.users.user(uuidv4()).activate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          statusCode: 404,
          error: 'Not Found',
          message: 'User does not exist.'
        })
      );
    }
  });

  it('should return an error when deactivating a user that doesnt exist', async () => {
    try {
      await adminSession.resources.users.user(uuidv4()).deactivate();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          statusCode: 404,
          error: 'Not Found',
          message: 'User does not exist.'
        })
      );
    }
  });
});
