/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('update environment types', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const testEnvTypeId = 'et-prod-1234567890124,pa-1234567890124';
  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('fails when trying to update invalid prop', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType(testEnvTypeId).update(
        {
          invalidProp: 'invalidValue'
        },
        true
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: ": Unrecognized key(s) in object: 'invalidProp'"
        })
      );
    }
  });

  test('fails when trying to update invalid environment Type', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType(testEnvTypeId).update(
        {
          name: 'new Name',
          status: 'APPROVED'
        },
        true
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          statusCode: 404,
          error: 'Not Found',
          message: `Could not find environment type ${testEnvTypeId} to update`
        })
      );
    }
  });

  test('fails when trying to update invalid environment Type id format', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType('wrong-format-id').update(
        {
          name: 'new Name'
        },
        true
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          statusCode: 403,
          error: 'User is not authorized'
        })
      );
    }
  });
});
