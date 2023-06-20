/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Status } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

const fakeUuid = '00000000-0000-0000-0000-000000000000';
const invalidUuid = '12345';

describe('userManagement activate/deactivate user integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let userId: string;
  const mockUserData = {
    firstName: 'Test',
    lastName: 'User',
    email: `success+activate-deactivate-user-${uuidv4()}@simulator.amazonses.com`
  };

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();

    const { data } = await adminSession.resources.users.create(mockUserData);
    userId = data.id;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  it('should be able to activate an inactive user', async () => {
    await adminSession.resources.users.user(userId).deactivate();
    await adminSession.resources.users.user(userId).activate();

    const { data: activeUser } = await adminSession.resources.users.user(userId).get();

    expect(activeUser).toStrictEqual({
      ...mockUserData,
      id: expect.any(String),
      roles: [],
      status: Status.ACTIVE
    });
  });

  it('should be able to deactivate an active user', async () => {
    await adminSession.resources.users.user(userId).activate();
    await adminSession.resources.users.user(userId).deactivate();

    const { data: inactiveUser } = await adminSession.resources.users.user(userId).get();

    expect(inactiveUser).toStrictEqual({
      ...mockUserData,
      id: expect.any(String),
      roles: [],
      status: Status.INACTIVE
    });
  });

  it('should do nothing when a user is already active', async () => {
    await adminSession.resources.users.user(userId).activate();
    await adminSession.resources.users.user(userId).activate();

    const { data: activeUser } = await adminSession.resources.users.user(userId).get();

    expect(activeUser).toStrictEqual({
      ...mockUserData,
      id: expect.any(String),
      roles: [],
      status: Status.ACTIVE
    });
  });

  it('should do nothing when a user is already inactive', async () => {
    await adminSession.resources.users.user(userId).deactivate();
    await adminSession.resources.users.user(userId).deactivate();

    const { data: activeUser } = await adminSession.resources.users.user(userId).get();

    expect(activeUser).toStrictEqual({
      id: expect.any(String),
      ...mockUserData,
      status: Status.INACTIVE,
      roles: []
    });
  });

  it('should return a 404 error when activating a user that doesnt exist', async () => {
    await expect(adminSession.resources.users.user(fakeUuid).activate()).rejects.toThrow(
      new HttpError(404, {})
    );
  });

  it('should return a 404 error when deactivating a user that doesnt exist', async () => {
    await expect(adminSession.resources.users.user(fakeUuid).deactivate()).rejects.toThrow(
      new HttpError(404, {})
    );
  });

  it('should return a 403 error when activating a user with an invalid UUID', async () => {
    await expect(adminSession.resources.users.user(invalidUuid).activate()).rejects.toThrow(
      new HttpError(403, {})
    );
  });

  it('should return a 403 error when deactivating a user with an invalid UUID', async () => {
    await expect(adminSession.resources.users.user(invalidUuid).deactivate()).rejects.toThrow(
      new HttpError(403, {})
    );
  });
});
