/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateUser } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import { AddUserToGroupRequest } from '../../support/resources/dynamicAuthorization/groups';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('dynamic authorization group integration tests', () => {
  const setup: Setup = new Setup();
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

  describe('createGroup', () => {
    it('creates a group', async () => {
      const { data } = await adminSession.resources.groups.create();

      expect(typeof data.groupId).toBe('string');
    });

    it('returns a 400 error when trying to create a group that already exists', async () => {
      const { data } = await adminSession.resources.groups.create();
      await expect(adminSession.resources.groups.create({ groupId: data.groupId })).rejects.toThrow(
        new HttpError(400, {})
      );
    });

    it('returns a 400 error when the groupId parameter is missing', async () => {
      const invalidParam: Record<string, unknown> = { description: 'description' };
      await expect(adminSession.resources.groups.create(invalidParam, false)).rejects.toThrow(
        new HttpError(400, {})
      );
    });

    it('returns a 400 error when the groupId parameter is the wrong type', async () => {
      const invalidParam: Record<string, unknown> = { groupId: 123, description: 'description' };
      await expect(adminSession.resources.groups.create(invalidParam, false)).rejects.toThrow(
        new HttpError(400, {})
      );
    });

    it('returns a 400 error when the description parameter is the wrong type', async () => {
      const invalidParam: Record<string, unknown> = { groupId: 'groupId', description: 123 };
      await expect(adminSession.resources.groups.create(invalidParam, false)).rejects.toThrow(
        new HttpError(400, {})
      );
    });

    it('returns a 400 error when there is an unexpected parameter', async () => {
      const invalidParam: Record<string, unknown> = {
        groupId: 'groupId',
        description: 'description',
        badParam: 'bad'
      };
      await expect(adminSession.resources.groups.create(invalidParam, false)).rejects.toThrow(
        new HttpError(400, {})
      );
    });
  });

  describe('getUserGroups', () => {
    let fakeUuid: string;
    let user: CreateUser;

    beforeEach(() => {
      user = {
        firstName: 'Test',
        lastName: 'User',
        email: `success+get-user-groups-${uuidv4()}@simulator.amazonses.com`
      };
      fakeUuid = '00000000-0000-0000-0000-000000000000';
    });

    it('get the groups a user is in', async () => {
      const { data: userData } = await adminSession.resources.users.create(user);
      const { data: groupData } = await adminSession.resources.groups.create();
      await adminSession.resources.groups.addUser({ groupId: groupData.groupId, userId: userData.id });

      const { data } = await adminSession.resources.groups.getUserGroups(userData.id);

      expect(data).toMatchObject({ groupIds: [groupData.groupId] });
    });

    it('returns a 404 error when the user doesnt exist', async () => {
      await expect(adminSession.resources.groups.getUserGroups(fakeUuid)).rejects.toThrow(
        new HttpError(404, {})
      );
    });

    it('returns a 403 error when the userId parameter is not a uuid', async () => {
      await expect(adminSession.resources.groups.getUserGroups('not a UUID')).rejects.toThrow(
        new HttpError(403, {})
      );
    });
  });

  describe('assignUserToGroup', () => {
    let user: CreateUser;

    beforeEach(() => {
      user = {
        firstName: 'Test',
        lastName: 'User',
        email: `success+add-user-to-group-${uuidv4()}@simulator.amazonses.com`
      };
    });

    it('assigns user to exiting group', async () => {
      const { data: createUserData } = await adminSession.resources.users.create(user);
      const { data: createGroupData } = await adminSession.resources.groups.create();
      const { data } = await adminSession.resources.groups.addUser({
        groupId: createGroupData.groupId,
        userId: createUserData.id
      });
      expect(data).toMatchObject({ groupId: createGroupData.groupId, userId: createUserData.id });
    });

    test.each([
      {},
      { groupId: 'testGroupId' },
      { userId: 'testUserId' },
      { groupId: 'testGroupId', userId: 123 },
      { groupId: 123, userId: 'testUserId' },
      { groupId: 'testGroupId', userId: 'testUserId', badParam: 'bad' }
    ])('returns a 400 error for invalid body %s', async (body) => {
      await expect(adminSession.resources.groups.addUser(body as AddUserToGroupRequest)).rejects.toThrow(
        new HttpError(400, {})
      );
    });

    test.each([
      ['non-existing', 'non-existing'],
      ['existing', 'non-existing'],
      ['non-existing', 'existing']
    ])('returns a 404 error when trying to assing %s user to %s group', async (userExists, groupExists) => {
      let userId = 'invalidUserId';
      let groupId = 'invalidGroupId';
      if (userExists === 'existing') {
        const {
          data: { id }
        } = await adminSession.resources.users.create(user);
        userId = id;
      }

      if (groupExists === 'existing') {
        const { data } = await adminSession.resources.groups.create();
        groupId = data.groupId;
      }

      await expect(adminSession.resources.groups.addUser({ groupId, userId })).rejects.toThrow(
        new HttpError(404, {})
      );
    });
  });

  describe('getGroupUsers', () => {
    // let fakeGroupUuid: string;
    let user: CreateUser;

    beforeEach(() => {
      user = {
        firstName: 'Test',
        lastName: 'User',
        email: `success+get-group-users-${uuidv4()}@simulator.amazonses.com`
      };
      // fakeGroupUuid = '00000000-0000-0000-0000-000000000000';
    });

    it('get the users in a group', async () => {
      const { data: userData } = await adminSession.resources.users.create(user);
      const { data: groupData } = await adminSession.resources.groups.create();
      await adminSession.resources.groups.addUser({ groupId: groupData.groupId, userId: userData.id });

      const { data } = await adminSession.resources.groups.getGroupUsers(groupData.groupId);

      expect(data).toMatchObject({ userIds: [userData.id] });
    });

    // it('returns a 404 error when the Group doesnt exist', async () => {
    //   await expect(adminSession.resources.groups.getGroupUsers(fakeGroupUuid)).rejects.toThrow(
    //     new HttpError(404, {})
    //   );
    // });

    // it('returns a 403 error when the userId parameter is not a uuid', async () => {
    //   await expect(adminSession.resources.groups.getGroupUsers('not a UUID')).rejects.toThrow(
    //     new HttpError(403, {})
    //   );
    // });
  });
});
