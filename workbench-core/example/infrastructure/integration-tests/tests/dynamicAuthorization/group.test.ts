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
      console.log(`/roles/${new RegExp(/\S+/).toString()}`);
      const { data: userData } = await adminSession.resources.users.create(user);
      const { data: groupData } = await adminSession.resources.groups.create();
      // TODO add user to group

      const { data } = await adminSession.resources.groups.getUserGroups(userData.id);

      expect(data).toMatchObject({ groupIds: [groupData.groupId] });
    });

    it('returns a 404 error when the user doesnt exist', async () => {
      await expect(adminSession.resources.groups.getUserGroups(fakeUuid)).rejects.toThrow(
        new HttpError(400, {})
      );
    });

    it('returns a 400 error when the userId parameter is not a uuid', async () => {
      await expect(adminSession.resources.groups.getUserGroups('not a UUID')).rejects.toThrow(
        new HttpError(400, {})
      );
    });
  });
});
