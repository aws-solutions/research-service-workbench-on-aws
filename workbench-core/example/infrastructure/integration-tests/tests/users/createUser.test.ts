/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateUser, Status } from '@aws/workbench-core-authentication';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';
import { checkHttpError } from '../../support/utils/utilities';
// import RandomTextGenerator from '../../../support/utils/randomTextGenerator';

describe('userManagement create user integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  // const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  it('should return a created user', async () => {
    const user: CreateUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'fakeemail@notanemail.com'
    };

    const response = await adminSession.resources.users.create(user);

    expect(response.data).toMatchObject({
      ...user,
      status: Status.ACTIVE,
      roles: []
    });
  });

  it('should return an error when a user with the provided email already exists', async () => {
    const user: CreateUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'fakeemail2@notanemail.com'
    };

    try {
      // create user
      await adminSession.resources.users.create(user);
      // create user again
      await adminSession.resources.users.create(user);
    } catch (e) {
      console.log(e);
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: "requires property 'datasetName'"
        })
      );
    }
  });

  it('should return an error when the provided email is not a valid email address', async () => {
    const user: CreateUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'notanemail'
    };

    try {
      await adminSession.resources.users.create(user);
    } catch (e) {
      console.log(e);
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: "requires property 'datasetName'"
        })
      );
    }
  });
});
