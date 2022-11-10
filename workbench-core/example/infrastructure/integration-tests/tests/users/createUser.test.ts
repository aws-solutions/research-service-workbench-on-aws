/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateUser, Status } from '@aws/workbench-core-authentication';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';
import { checkHttpError } from '../../support/utils/utilities';

describe('userManagement create user integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let user: CreateUser;

  beforeEach(() => {
    expect.hasAssertions();

    user = {
      firstName: 'Test',
      lastName: 'User',
      email: 'create@user.com'
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

  it('should return an error when a user with the provided email already exists', async () => {
    try {
      await adminSession.resources.users.create(user);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: 'An account with the given email already exists.'
        })
      );
    }
  });

  it('should return an error when the provided email is not a valid email address', async () => {
    try {
      await adminSession.resources.users.create({ ...user, email: 'notanemail' });
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid email address format.'
        })
      );
    }
  });

  it('should return an error when the email parameter is missing', async () => {
    try {
      const invalidParam: { [id: string]: unknown } = { ...user };
      delete invalidParam.email;
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: "requires property 'email'"
        })
      );
    }
  });

  it('should return an error when the email parameter is the wrong type', async () => {
    try {
      const invalidParam: { [id: string]: unknown } = { ...user };
      invalidParam.email = 123;
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: 'email is not of a type(s) string'
        })
      );
    }
  });

  it('should return an error when the firstName parameter is missing', async () => {
    try {
      const invalidParam: { [id: string]: unknown } = { ...user };
      delete invalidParam.firstName;
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: "requires property 'firstName'"
        })
      );
    }
  });

  it('should return an error when the firstName parameter is the wrong type', async () => {
    try {
      const invalidParam: { [id: string]: unknown } = { ...user };
      invalidParam.firstName = 123;
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: 'firstName is not of a type(s) string'
        })
      );
    }
  });

  it('should return an error when the lastName parameter is missing', async () => {
    try {
      const invalidParam: { [id: string]: unknown } = { ...user };
      delete invalidParam.lastName;
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: "requires property 'lastName'"
        })
      );
    }
  });

  it('should return an error when the lastName parameter is the wrong type', async () => {
    try {
      const invalidParam: { [id: string]: unknown } = { ...user };
      invalidParam.lastName = 123;
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: 'lastName is not of a type(s) string'
        })
      );
    }
  });
});
