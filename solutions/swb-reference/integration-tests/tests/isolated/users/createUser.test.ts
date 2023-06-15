/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateUser, Status } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('create user negative tests', () => {
  const paabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;
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
    ({ adminSession, pa1Session, rs1Session, anonymousSession } = await paabHelper.createResources(
      __filename
    ));
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  it('ITAdmin should return a created user', async () => {
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
          message: 'email: Invalid Email'
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
          message: `email: Required`
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
          message: `email: Expected string, received number`
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
          message: `firstName: Required`
        })
      );
    }
  });

  it('should return a 400 error when the firstName parameter is empty', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    invalidParam.firstName = '';
    try {
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message:
            'firstName: must contain only letters, spaces, numbers, hyphens, and periods. firstName: Required'
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
          message: `firstName: Expected string, received number`
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
          message: `lastName: Required`
        })
      );
    }
  });

  it('should return a 400 error when the lastName parameter is empty', async () => {
    const invalidParam: Record<string, unknown> = { ...user };
    invalidParam.lastName = '';
    try {
      await adminSession.resources.users.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message:
            'lastName: must contain only letters, spaces, numbers, hyphens, and periods. lastName: Required'
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
          message: `lastName: Expected string, received number`
        })
      );
    }
  });

  it('ProjectAdmin: should return 403 error when try to create a user', async () => {
    try {
      await pa1Session.resources.users.create(user);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  it('Researcher: should return 403 error when try to create a user', async () => {
    try {
      await rs1Session.resources.users.create(user);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  it('Unauthenticated user: should return 403 error when try to create a user', async () => {
    try {
      await anonymousSession.resources.users.create(user);
    } catch (e) {
      checkHttpError(e, new HttpError(403, {}));
    }
  });
});
