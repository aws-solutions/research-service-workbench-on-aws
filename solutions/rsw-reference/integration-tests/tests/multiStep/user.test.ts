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
  let rs1Session: ClientSession;

  beforeAll(async () => {
    ({ adminSession, pa1Session, rs1Session } = await paabHelper.createResources(__filename));
  });

  beforeEach(async () => {
    expect.hasAssertions();
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('multistep', () => {
    test('Create read update delete user', async () => {
      // create user
      const mockUserInput = {
        firstName: 'Test',
        lastName: 'User'
      };

      console.log('ITAdmin creating a user');
      const { data } = await adminSession.resources.users.create({
        ...mockUserInput,
        email: `success+activate-deactivate-user-${uuidv4()}@simulator.amazonses.com`
      });
      const mockUserId = data.id;

      const mockUser = {
        ...mockUserInput,
        id: mockUserId
      };

      console.log('ITAdmin getting the user created');
      const { data: acutalUserGetByITAdmin } = await adminSession.resources.users.user(mockUserId).get();
      expect(acutalUserGetByITAdmin).toMatchObject(mockUser);

      // test PA should see the same result of  `List Users` as ITAdmin
      console.log('ITAdmin and ProjectAdmin listing all users');
      const [allUsersListedByITAdmin, allUsersListedByPA] = await Promise.all([
        adminSession.resources.users.get(),
        pa1Session.resources.users.get()
      ]);
      expect(allUsersListedByPA.data).toEqual(allUsersListedByITAdmin.data);

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

      console.log('ProjectAdmin getting a user by userId');
      const { data: acutalUserGetByPA } = await pa1Session.resources.users.user(mockUserId).get();
      expect(acutalUserGetByPA).toMatchObject(mockUser);

      console.log('Researcher cannot call get a user by userId');
      try {
        await rs1Session.resources.users.user(mockUserId).get();
      } catch (e) {
        new HttpError(403, {
          error: 'User is not authorized'
        });
      }

      console.log('ITAdmin can update the user');
      const updateMockUserInput = { firstName: 'updatedFirstName', lastName: 'updatedLastName' };
      await adminSession.resources.users.user(mockUserId).update(updateMockUserInput, true);
      const { data: updatedUser } = await adminSession.resources.users.user(mockUserId).get();
      expect(updatedUser).toMatchObject({
        ...updateMockUserInput,
        id: mockUserId
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
            message: `Could not find user`
          })
        );
      }
    });
  });
});
