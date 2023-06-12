/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { Status } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import { PaabHelper } from '../../support/complex/paabHelper';
import HttpError from '../../support/utils/HttpError';
import { checkHttpError } from '../../support/utils/utilities';

describe('multiStep users integration test', () => {
  const paabHelper = new PaabHelper(0);
  let adminSession: ClientSession;
  let pa1Session: ClientSession;

  beforeAll(async () => {
    ({ adminSession, pa1Session } = await paabHelper.createResources(__filename));
  });

  beforeEach(async () => {
    expect.hasAssertions();
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  test('Create read update delete user happy path', async () => {
    // create user
    const mockUserInput = {
      firstName: 'Test',
      lastName: 'User'
    };

    const { data } = await adminSession.resources.users.create({
      ...mockUserInput,
      email: `success+activate-deactivate-user-${uuidv4()}@simulator.amazonses.com`
    });
    const mockUserId = data.id;

    const mockUser = {
      ...mockUserInput,
      id: mockUserId
    };

    const { data: acutalUserGetByITAdmin } = await adminSession.resources.users.user(mockUserId).get();
    expect(acutalUserGetByITAdmin).toMatchObject(mockUser);

    // test PA should see the same result of  `List Users` as ITAdmin
    const { data: allUsersListedByITAdmin } = await adminSession.resources.users.get();
    const { data: allUsersListedByPA } = await pa1Session.resources.users.get();
    expect(allUsersListedByPA).toEqual(allUsersListedByITAdmin);

    // test pagination
    await adminSession.resources.users.create({
      ...mockUserInput,
      email: `success+activate-deactivate-user-${uuidv4()}@simulator.amazonses.com`
    });
    const listResponse = await adminSession.resources.users.get({ pageSize: 1 });
    expect(listResponse.data.users.data.length).toEqual(1);
    const user1Id = listResponse.data.users.data[0].id;
    const paginationToken = listResponse.data.users.paginationToken;
    expect(paginationToken).toBeDefined();

    const listResponse2 = await adminSession.resources.users.get({ pageSize: 1, paginationToken });
    expect(listResponse2.data.users.data.length).toEqual(1);
    const user2Id = listResponse2.data.users.data[0].id;
    expect(user1Id).not.toEqual(user2Id);

    // test PA has permission of `Get User`
    const { data: acutalUserGetByPA } = await pa1Session.resources.users.user(mockUserId).get();
    expect(acutalUserGetByPA).toMatchObject(mockUser);

    const updateMockUserInput = { firstName: 'updatedFirstName', lastName: 'updatedLastName' };
    await adminSession.resources.users.user(mockUserId).update(updateMockUserInput, true);
    const { data: updatedUser } = await adminSession.resources.users.user(mockUserId).get();
    expect(updatedUser).toMatchObject({
      ...updateMockUserInput,
      id: mockUserId
    });

    await adminSession.resources.users.user(mockUserId).activate();
    const { data: activeUser } = await adminSession.resources.users.user(mockUserId).get();
    expect(activeUser).toMatchObject({
      status: Status.ACTIVE
    });

    await adminSession.resources.users.user(mockUserId).deactivate();
    const { data: inactiveUser } = await adminSession.resources.users.user(mockUserId).get();
    expect(inactiveUser).toMatchObject({
      status: Status.INACTIVE
    });

    await adminSession.resources.users.user(mockUserId).purge();
    try {
      await adminSession.resources.users.user(mockUserId).get();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find user ${mockUserId}`
        })
      );
    }
  });
});
