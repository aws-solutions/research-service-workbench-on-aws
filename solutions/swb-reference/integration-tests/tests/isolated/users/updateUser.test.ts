/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Status, User } from '@aws/workbench-core-user-management';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('update user negative tests', () => {
  const setup: Setup = Setup.getSetup();
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

  it('should return a 400 error when the provided email is not a valid email address', async () => {
    try {
      const users = await adminSession.resources.users.get();
      const user: User = users.data.users.find((user: User) => user.status === Status.ACTIVE);

      await adminSession.resources.users.user(user.id).update({ email: 'notanemail' });
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
});
