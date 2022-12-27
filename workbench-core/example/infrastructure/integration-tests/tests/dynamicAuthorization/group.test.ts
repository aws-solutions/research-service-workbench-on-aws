/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateUser } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
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

  describe('assignUserToGroup', () => {
    let user: CreateUser;

    beforeEach(() => {
      user = {
        firstName: 'Test',
        lastName: 'User',
        email: `success+create-user-${uuidv4()}@simulator.amazonses.com`
      };
    });

    it('assigns user to exiting group', async () => {
      const { data: createUserData } = await adminSession.resources.users.create(user);
      const { data: createGroupData } = await adminSession.resources.groups.create();

      const group = adminSession.resources.groups.group(createGroupData.groupId);

      const { data } = await group.addUser({ userId: createUserData.id });
      expect(typeof data.added).toBeTruthy();
    });

    test.each([
      {},
      { groupId: 'testGroupId' },
      { userId: 'testUserId' },
      { groupId: 'testGroupId', userId: 123 },
      { groupId: 123, userId: 'testUserId' },
      { groupId: 'testGroupId', userId: 'testUserId', badParam: 'bad' }
    ])('returns a 400 error for invalid body %s', async (body) => {
      const group = adminSession.resources.groups.group('invalidGroupId');

      await expect(group.addUser(body, false)).rejects.toThrow(new HttpError(400, {}));
    });

    test.each([
      ['non-existing', 'non-existing'],
      ['existing', 'non-existing'],
      ['non-existing', 'existing']
    ])('returns a 429 error when trying to assing %s user to %s group', async (userExists, groupExists) => {
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

      const group = adminSession.resources.groups.group(groupId);

      await expect(group.addUser({ userId })).rejects.toThrow(new HttpError(429, {}));
    });
  });
});
