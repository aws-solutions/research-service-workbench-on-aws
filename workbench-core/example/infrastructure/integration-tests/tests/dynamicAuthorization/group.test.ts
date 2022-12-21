/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

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
});
