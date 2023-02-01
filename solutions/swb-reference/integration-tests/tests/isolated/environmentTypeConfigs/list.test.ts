/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list environment type configs', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const envTypeId = setup.getSettings().get('envTypeId');

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('list environments type configs excecutes successfully', async () => {
    const { data: response } = await adminSession.resources.environmentTypes
      .environmentType(envTypeId)
      .configurations()
      .get({});
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('list environments type configs fails when using invalid format envType Id', async () => {
    try {
      await adminSession.resources.environmentTypes
        .environmentType('invalid-envType-id')
        .configurations()
        .get({});
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
