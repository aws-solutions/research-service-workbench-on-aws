/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { Status } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';
import { checkHttpError } from '../../support/utils/utilities';

describe('multiStep users integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('Create read update delete user', async () => {
    // create user
    const { data } = await adminSession.resources.users.create({
      firstName: 'Test',
      lastName: 'User',
      email: `success+activate-deactivate-user-${uuidv4()}@simulator.amazonses.com`
    });

    const userId = data.id;

    const { data: user } = await adminSession.resources.users.user(userId).get();
    expect(user).toMatchObject({
      firstName: 'Test',
      lastName: 'User',
      id: userId
    });

    await adminSession.resources.users
      .user(userId)
      .update({ firstName: 'updatedFirstName', lastName: 'updatedLastName' }, true);
    const { data: updatedUser } = await adminSession.resources.users.user(userId).get();
    expect(updatedUser).toMatchObject({
      firstName: 'updatedFirstName',
      lastName: 'updatedLastName',
      id: userId
    });

    await adminSession.resources.users.user(userId).activate();
    const { data: activeUser } = await adminSession.resources.users.user(userId).get();
    expect(activeUser).toMatchObject({
      status: Status.ACTIVE
    });

    await adminSession.resources.users.user(userId).deactivate();
    const { data: inactiveUser } = await adminSession.resources.users.user(userId).get();
    expect(inactiveUser).toMatchObject({
      status: Status.INACTIVE
    });

    await adminSession.resources.users.user(userId).delete();
    try {
      await adminSession.resources.users.user(userId).get();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find user ${userId}`
        })
      );
    }
  });

  test('Create user and associate to a role', async () => {
    // create user
    const { data } = await adminSession.resources.users.create({
      firstName: 'Test',
      lastName: 'User',
      email: `success+activate-deactivate-user-${uuidv4()}@simulator.amazonses.com`
    });

    const userId = data.id;

    const { data: user } = await adminSession.resources.users.user(userId).get();
    expect(user).toMatchObject({
      firstName: 'Test',
      lastName: 'User',
      id: userId
    });

    await adminSession.resources.users.user(userId).update({ roles: ['ITAdmin'] }, true);
    const { data: adminUser } = await adminSession.resources.users.user(userId).get();
    expect(adminUser).toMatchObject({
      roles: ['ITAdmin'],
      id: userId
    });
  });
});
