/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('update environment type configs', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const envTypeId = setup.getSettings().get('envTypeId');
  const envTypeConfigId = setup.getSettings().get('envTypeConfigId');

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
      await adminSession.resources.environmentTypes
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .update(
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

  test('fails when trying to update invalid environment Type Config', async () => {
    try {
      await adminSession.resources.environmentTypes
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig('etc-12345678-1234-1234-1234-123456789012')
        .update(
          {
            description: 'new Description'
          },
          true
        );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          statusCode: 404,
          error: 'Not Found',
          message: `Could not find envType ${envTypeId} with envTypeConfig etc-12345678-1234-1234-1234-123456789012 to update`
        })
      );
    }
  });

  test('fails when trying to update invalid environment Type id format', async () => {
    try {
      await adminSession.resources.environmentTypes
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig('wrong-format-id')
        .update(
          {
            description: 'new Description'
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
