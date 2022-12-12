/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateUser } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';

describe('userManagement list users integration test', () => {
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

  it('should return a list containing the newly created user and the default user', async () => {
    const userToCreate1: CreateUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `success+list-users-${uuidv4()}@simulator.amazonses.com`
    };

    const userToCreate2: CreateUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `success+list-users-${uuidv4()}@simulator.amazonses.com`
    };

    const { data: createdUser1 } = await adminSession.resources.users.create(userToCreate1);
    const { data: createdUser2 } = await adminSession.resources.users.create(userToCreate2);
    const response = await adminSession.resources.users.get();

    expect(response.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ...createdUser1 }),
        expect.objectContaining({ ...createdUser2 })
      ])
    );
  });
});
