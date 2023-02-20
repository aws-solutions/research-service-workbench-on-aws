/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateUser, Status } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('create user negative tests', () => {
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

    expect(response.data).toMatchObject({
      ...user,
      status: Status.ACTIVE,
      roles: []
    });
  });

  it('should return a 400 error when a user with the provided email already exists', async () => {
    // create user
    await adminSession.resources.users.create(user);

    try {
      //try to create it again
      await adminSession.resources.users.create(user);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(409, {
          error: 'Conflict',
          message: 'User with this email already exist.'
        })
      );
    }
  });

  it('should return a 400 error when the provided email is not a valid email address', async () => {
    try {
      await adminSession.resources.users.create({ ...user, email: 'notanemail' });
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: 'Invalid parameter: Invalid email address format.'
        })
      );
    }
  });

  it('should return a 400 error when the email parameter is missing', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    delete invalidParam.email;
    try {
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `requires property 'email'`
        })
      );
    }
  });

  it('should return a 400 error when the email parameter is the wrong type', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    invalidParam.email = 123;
    try {
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `email is not of a type(s) string`
        })
      );
    }
  });

  it('should return a 400 error when the firstName parameter is missing', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    delete invalidParam.firstName;
    try {
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `requires property 'firstName'`
        })
      );
    }
  });

  it('should return a 400 error when the firstName parameter is the wrong type', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    invalidParam.firstName = 123;
    try {
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `firstName is not of a type(s) string`
        })
      );
    }
  });

  it('should return a 400 error when the lastName parameter is missing', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    delete invalidParam.lastName;
    try {
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `requires property 'lastName'`
        })
      );
    }
  });

  it('should return a 400 error when the lastName parameter is the wrong type', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    invalidParam.lastName = 123;
    try {
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `lastName is not of a type(s) string`
        })
      );
    }
  });
});
