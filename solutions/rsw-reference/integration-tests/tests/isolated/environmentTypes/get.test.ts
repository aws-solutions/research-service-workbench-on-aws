/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('get environment type', () => {
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  let anonymousSession: ClientSession;
  const invalidIds = [
    'et1-prod-1234567890123,pa-1234567890123', //invalid prefix
    'et-prod1-1234567890123,pa-1234567890123', //invalid product prefix
    'et-prod-12345678901234,pa-1234567890123', //invalid product length
    'et-prod-123456789012$,pa-1234567890123', //invalid product character
    'et-prod-1234567890123,pa1-1234567890123', //invalid provisioning artifact prefix
    'et-prod-1234567890123,pa-1234567890123423', //invalid provisioning artifact length
    'et-prod-1234567890123,pa-123456789012$' //invalid provisioning artifact character
  ];
  const testEnvTypeId = 'et-prod-0123456789012,pa-0123456789012';
  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    anonymousSession = await setup.createAnonymousSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test.each(invalidIds)('IT Admin fails when trying to get invalid format id', async (invalidId) => {
    try {
      await adminSession.resources.environmentTypes.environmentType(invalidId).get();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: 'envTypeId: Invalid ID'
        })
      );
    }
  });

  test('IT Admin fails when trying to get non existing environment Type', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType(testEnvTypeId).get();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find environment type`
        })
      );
    }
  });

  test('Unauthenticated user fails when trying to get environment Type', async () => {
    try {
      await anonymousSession.resources.environmentTypes.environmentType(testEnvTypeId).get();
    } catch (e) {
      checkHttpError(e, new HttpError(401, {}));
    }
  });
});
