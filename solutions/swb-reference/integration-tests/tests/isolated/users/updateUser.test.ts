/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Status, User } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('update user negative tests', () => {
  const paabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;
  let mockUserId: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    ({ adminSession, pa1Session, rs1Session, anonymousSession } = await paabHelper.createResources(
      __filename
    ));
    // create user
    const mockUserInput = {
      firstName: 'Test',
      lastName: 'User'
    };

    const { data } = await adminSession.resources.users.create({
      ...mockUserInput,
      email: `success+activate-deactivate-user-${uuidv4()}@simulator.amazonses.com`
    });
    mockUserId = data.id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  it('should return a 400 error when the provided email is not a valid email address', async () => {
    try {
      const updateMockUserInput = { email: 'notanemail' };
      const response = await adminSession.resources.users.user(mockUserId).update(updateMockUserInput, true);
      console.log(JSON.stringify(response));
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

  it('should return a 400 error when the provided names are not valid', async () => {
    try {
      const updateMockUserInput = { firstName: '!nv@lid Name' };
      const response = await adminSession.resources.users.user(mockUserId).update(updateMockUserInput, true);
      console.log(JSON.stringify(response));
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: 'firstName: must contain only letters, spaces, numbers, hyphens, and periods'
        })
      );
    }

    try {
      const updateMockUserInput = { lastName: '!nv@lid Name' };
      const response = await adminSession.resources.users.user(mockUserId).update(updateMockUserInput, true);
      console.log(JSON.stringify(response));
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: 'lastName: must contain only letters, spaces, numbers, hyphens, and periods'
        })
      );
    }
  });

  it('should return a 400 error when the provided status is unknown', async () => {
    try {
      const updateMockUserInput = { status: 'someInvalidStatus' };
      const response = await adminSession.resources.users.user(mockUserId).update(updateMockUserInput, true);
      console.log(JSON.stringify(response));
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: "status: Invalid enum value. Expected 'ACTIVE' | 'INACTIVE', received 'someInvalidStatus'"
        })
      );
    }
  });

  it('should return a 400 error when role is being updated', async () => {
    try {
      const updateMockUserInput = { roles: ['ITAdmin'] };
      const response = await adminSession.resources.users.user(mockUserId).update(updateMockUserInput, true);
      console.log(JSON.stringify(response));
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: ": Unrecognized key(s) in object: 'roles'"
        })
      );
    }
  });

  test('negative test ProjectAdmin: should return 403 error when update a user', async () => {
    let userId = '';
    const updateMockUserInput = { firstName: 'updatedFirstName', lastName: 'updatedLastName' };
    try {
      const users = await adminSession.resources.users.get();
      const user: User = users.data.users.data.find((user: User) => user.status === Status.ACTIVE);

      expect(user).toBeDefined();

      userId = user.id;
      await pa1Session.resources.users.user(userId).update(updateMockUserInput, true);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  test('negative test Researcher: should return 403 error when update a user', async () => {
    let userId = '';
    const updateMockUserInput = { firstName: 'updatedFirstName', lastName: 'updatedLastName' };
    try {
      const users = await adminSession.resources.users.get();
      const user: User = users.data.users.data.find((user: User) => user.status === Status.ACTIVE);

      expect(user).toBeDefined();

      userId = user.id;
      await rs1Session.resources.users.user(userId).update(updateMockUserInput, true);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  test('negative test unauthenticated user: should return 403 error when update a user', async () => {
    let userId = '';
    const updateMockUserInput = { firstName: 'updatedFirstName', lastName: 'updatedLastName' };
    try {
      const users = await adminSession.resources.users.get();
      const user: User = users.data.users.data.find((user: User) => user.status === Status.ACTIVE);

      expect(user).toBeDefined();

      userId = user.id;
      await anonymousSession.resources.users.user(userId).update(updateMockUserInput, true);
    } catch (e) {
      checkHttpError(e, new HttpError(403, {}));
    }
  });
});
