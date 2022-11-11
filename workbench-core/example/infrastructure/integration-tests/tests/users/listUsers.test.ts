/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateUser } from '@aws/workbench-core-authentication';
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

  it('should return a list containing only the default user', async () => {
    const response = await adminSession.resources.users.get();

    expect(response.data.length).toBe(1);
  });

  it('should return a list containing the newly created user and the default user', async () => {
    const userToCreate: CreateUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'list@users.com'
    };

    const { data: createdUser } = await adminSession.resources.users.create(userToCreate);
    const response = await adminSession.resources.users.get();

    expect(response.data.length).toBe(2);
    expect(response.data).toEqual(expect.arrayContaining([expect.objectContaining({ ...createdUser })]));
  });
});
