/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateUser, Status } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('userManagement create user integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let user: CreateUser;

  beforeEach(() => {
    expect.hasAssertions();

    user = {
      firstName: 'Test',
      lastName: 'User',
      email: `success+create-user-${uuidv4()}@simulator.amazonses.com`
    };
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  it('should return a created user', async () => {
    const response = await adminSession.resources.users.create(user);

    expect(response.data).toStrictEqual({
      ...user,
      id: expect.any(String),
      status: Status.ACTIVE,
      roles: []
    });
  });

  it('should return a 400 error when a user with the provided email already exists', async () => {
    // create user
    await adminSession.resources.users.create(user);
    //try to create it again
    await expect(adminSession.resources.users.create(user)).rejects.toThrow(new HttpError(400, {}));
  });

  it('should return a 400 error when the provided email is not a valid email address', async () => {
    await expect(adminSession.resources.users.create({ ...user, email: 'notanemail' })).rejects.toThrow(
      new HttpError(400, {})
    );
  });

  it('should return a 400 error when the email parameter is missing', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    delete invalidParam.email;
    await expect(adminSession.resources.users.create(invalidParam, false)).rejects.toThrow(
      new HttpError(400, {})
    );
  });

  it('should return a 400 error when the email parameter is the wrong type', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    invalidParam.email = 123;
    await expect(adminSession.resources.users.create(invalidParam, false)).rejects.toThrow(
      new HttpError(400, {})
    );
  });

  it('should return a 400 error when the firstName parameter is missing', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    delete invalidParam.firstName;
    await expect(adminSession.resources.users.create(invalidParam, false)).rejects.toThrow(
      new HttpError(400, {})
    );
  });

  it('should return a 400 error when the firstName parameter is the wrong type', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    invalidParam.firstName = 123;
    await expect(adminSession.resources.users.create(invalidParam, false)).rejects.toThrow(
      new HttpError(400, {})
    );
  });

  it('should return a 400 error when the lastName parameter is missing', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    delete invalidParam.lastName;
    await expect(adminSession.resources.users.create(invalidParam, false)).rejects.toThrow(
      new HttpError(400, {})
    );
  });

  it('should return a 400 error when the lastName parameter is the wrong type', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    invalidParam.lastName = 123;
    await expect(adminSession.resources.users.create(invalidParam, false)).rejects.toThrow(
      new HttpError(400, {})
    );
  });
});
