/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateUser } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('userManagement get user roles integration test', () => {
  let setup: Setup;
  let adminSession: ClientSession;
  let user: CreateUser;
  let fakeUuid: string;

  beforeAll(async () => {
    setup = new Setup();
    adminSession = await setup.getDefaultAdminSession();
  });

  beforeEach(() => {
    expect.hasAssertions();

    user = {
      firstName: 'Test',
      lastName: 'User',
      email: `success+get-user-roles-${uuidv4()}@simulator.amazonses.com`
    };
    fakeUuid = '00000000-0000-0000-0000-000000000000';
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  it('returns a list containing the users roles', async () => {
    const roleName = `example-role-name-${uuidv4()}`; // TODO use roles.create() response once the route returns the created role name
    const { data: userData } = await adminSession.resources.users.create(user);
    await adminSession.resources.roles.create({ roleName });
    await adminSession.resources.roles.role(roleName).addUser({ userId: userData.id });

    const { data } = await adminSession.resources.users.user(userData.id).getRoles();

    expect(data).toStrictEqual([expect.any(String)]);
  });

  it('throws a 404 error when the user doesnt exist', async () => {
    await expect(adminSession.resources.users.user(fakeUuid).getRoles()).rejects.toThrow(
      new HttpError(404, {})
    );
  });

  it('throws a 403 error when the user id is not a UUID', async () => {
    await expect(adminSession.resources.users.user('not a UUID').getRoles()).rejects.toThrow(
      new HttpError(403, {})
    );
  });
});
