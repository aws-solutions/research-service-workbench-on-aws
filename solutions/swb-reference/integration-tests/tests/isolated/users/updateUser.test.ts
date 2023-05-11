/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('update user negative tests', () => {
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  let mockUserId: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
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
    await setup.cleanup();
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
          message: 'firstName: must contain only letters, spaces, numbers, and hyphens'
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
          message: 'lastName: must contain only letters, spaces, numbers, and hyphens'
        })
      );
    }
  });

  it('should return a 400 error when the provided role is too long', async () => {
    try {
      const updateMockUserInput = {
        roles: ['AReallyLongRoleNameThatDoesntMakeAnySenseButStillExistsForTestingPurposes']
      };
      const response = await adminSession.resources.users.user(mockUserId).update(updateMockUserInput, true);
      console.log(JSON.stringify(response));
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: 'roles.0: String must contain at most 55 character(s)'
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
});
