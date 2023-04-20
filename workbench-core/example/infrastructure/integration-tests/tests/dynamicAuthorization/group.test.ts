/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateUser } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import {
  AddUserToGroupRequest,
  RemoveUserFromGroupRequest
} from '../../support/resources/dynamicAuthorization/group';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('dynamic authorization group integration tests', () => {
  let fakeUserId: string;
  let fakeGroupId: string;
  let user: CreateUser;

  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();

    fakeUserId = '00000000-0000-0000-0000-000000000000';
    fakeGroupId = '00000000-0000-0000-0000-000000000000';
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
    beforeEach(() => {
      user = {
        firstName: 'Test',
        lastName: 'User',
        email: `success+get-user-groups-${uuidv4()}@simulator.amazonses.com`
      };
    });

    it('get the groups a user is in', async () => {
      const { data: userData } = await adminSession.resources.users.create(user);
      const { data: groupData } = await adminSession.resources.groups.create();
      await adminSession.resources.groups.group(groupData.groupId).addUser({ userId: userData.id });

      const { data } = await adminSession.resources.groups.getUserGroups(userData.id);

      expect(data).toStrictEqual({ groupIds: [groupData.groupId] });
    });

    it('returns a 404 error when the user doesnt exist', async () => {
      await expect(adminSession.resources.groups.getUserGroups(fakeUserId)).rejects.toThrow(
        new HttpError(404, {})
      );
    });

    it('returns a 403 error when the userId parameter is not a uuid', async () => {
      await expect(adminSession.resources.groups.getUserGroups('not a UUID')).rejects.toThrow(
        new HttpError(403, {})
      );
    });
  });

  describe('getGroupUsers', () => {
    beforeEach(() => {
      user = {
        firstName: 'Test',
        lastName: 'User',
        email: `success+get-group-users-${uuidv4()}@simulator.amazonses.com`
      };
    });

    it('get all the users of a group', async () => {
      const { data: userData } = await adminSession.resources.users.create(user);
      const { data: groupData } = await adminSession.resources.groups.create();
      await adminSession.resources.groups.group(groupData.groupId).addUser({ userId: userData.id });
      const { data } = await adminSession.resources.groups.group(groupData.groupId).getGroupUsers();

      expect(data).toStrictEqual({ userIds: [userData.id] });
    });

    it('returns a 404 error when the Group doesnt exist', async () => {
      await expect(adminSession.resources.groups.group(fakeGroupId).getGroupUsers()).rejects.toThrow(
        new HttpError(404, {})
      );
    });
  });

  describe('addUserToGroup', () => {
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
      const { data } = await adminSession.resources.groups.group(createGroupData.groupId).addUser({
        userId: createUserData.id
      });
      expect(data).toStrictEqual({ groupId: createGroupData.groupId, userId: createUserData.id });
    });

    test.each([{}, { userId: 123 }, { userId: 'testUserId', badParam: 'bad' }])(
      'returns a 400 error for invalid body %s',
      async (body) => {
        await expect(
          adminSession.resources.groups.group('fakeGroup').addUser(body as AddUserToGroupRequest)
        ).rejects.toThrow(new HttpError(400, {}));
      }
    );

    test.each([
      ['non-existing', 'non-existing'],
      ['existing', 'non-existing'],
      ['non-existing', 'existing']
    ])('returns a 404 error when trying to add a %s user to a %s group', async (userExists, groupExists) => {
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

      await expect(adminSession.resources.groups.group(groupId).addUser({ userId })).rejects.toThrow(
        new HttpError(404, {})
      );
    });
  });

  describe('isUserAssignedToGroup', () => {
    beforeEach(() => {
      user = {
        firstName: 'Test',
        lastName: 'User',
        email: `success+is-user-assigned-to-group-${uuidv4()}@simulator.amazonses.com`
      };
    });

    it('returns true when the user is in the group', async () => {
      const { data: userData } = await adminSession.resources.users.create(user);
      const { data: groupData } = await adminSession.resources.groups.create();
      await adminSession.resources.groups.group(groupData.groupId).addUser({
        userId: userData.id
      });

      const { data } = await adminSession.resources.groups
        .group(groupData.groupId)
        .isUserAssigned(userData.id);
      expect(data).toStrictEqual({ isAssigned: true });
    });

    it('returns false when the user is not in the group', async () => {
      const { data: userData } = await adminSession.resources.users.create(user);

      const { data } = await adminSession.resources.groups.group('fakeGroupId').isUserAssigned(userData.id);
      expect(data).toStrictEqual({ isAssigned: false });
    });

    it('returns a 404 error when the user doesnt exist', async () => {
      await expect(
        adminSession.resources.groups.group(fakeGroupId).isUserAssigned(fakeUserId)
      ).rejects.toThrow(new HttpError(404, {}));
    });

    it('returns a 403 error when the userId parameter is not a uuid', async () => {
      await expect(
        adminSession.resources.groups.group(fakeGroupId).isUserAssigned('not a UUID')
      ).rejects.toThrow(new HttpError(403, {}));
    });
  });

  describe('removeUserFromGroup', () => {
    beforeEach(() => {
      user = {
        firstName: 'Test',
        lastName: 'User',
        email: `success+remove-user-from-group-${uuidv4()}@simulator.amazonses.com`
      };
    });

    it('removes a user from a group', async () => {
      const { data: userData } = await adminSession.resources.users.create(user);
      const { data: groupData } = await adminSession.resources.groups.create();
      await adminSession.resources.groups.group(groupData.groupId).addUser({
        userId: userData.id
      });
      const { data } = await adminSession.resources.groups
        .group(groupData.groupId)
        .removeUser({ userId: userData.id });
      expect(data).toStrictEqual({ groupId: groupData.groupId, userId: userData.id });
    });

    test.each([{}, { userId: 123 }, { userId: 'testUserId', badParam: 'bad' }])(
      'returns a 400 error for invalid body %s',
      async (body) => {
        await expect(
          adminSession.resources.groups.group('fakeGroup').addUser(body as RemoveUserFromGroupRequest)
        ).rejects.toThrow(new HttpError(400, {}));
      }
    );

    test.each([
      ['non-existing', 'non-existing'],
      ['existing', 'non-existing'],
      ['non-existing', 'existing']
    ])(
      'returns a 404 error when trying to remove a %s user from a %s group',
      async (userExists, groupExists) => {
        let userId = 'invalidUserId';
        let groupId = 'invalidGroupId';

        if (userExists === 'existing') {
          const { data } = await adminSession.resources.users.create(user);
          userId = data.id;
        }

        if (groupExists === 'existing') {
          const { data } = await adminSession.resources.groups.create();
          groupId = data.groupId;
        }

        await expect(adminSession.resources.groups.group(groupId).removeUser({ userId })).rejects.toThrow(
          new HttpError(404, {})
        );
      }
    );
  });

  describe('deleteGroup', () => {
    it('deletes existing group', async () => {
      const {
        data: { groupId }
      } = await adminSession.resources.groups.create();
      const group = adminSession.resources.groups.group(groupId);

      const { data } = await group.delete();

      expect(data).toStrictEqual({ groupId });
    });

    it('returns a 404 error when trying to delete a group that does not exists', async () => {
      const group = adminSession.resources.groups.group('invalidUserId');

      await expect(group.delete()).rejects.toThrow(new HttpError(404, {}));
    });
  });

  describe('doesGroupExist', () => {
    test.each([true, false])('test does group exist', async (groupExists) => {
      let groupId = 'sampleGroupId';
      if (groupExists) {
        const { data } = await adminSession.resources.groups.create();
        groupId = data.groupId;
      }
      const { data } = await adminSession.resources.groups.group(groupId).doesGroupExist();
      expect(data).toStrictEqual({
        exist: groupExists
      });
    });
  });
});
