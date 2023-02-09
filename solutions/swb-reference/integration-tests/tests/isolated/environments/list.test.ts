/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list environments', () => {
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
  test('list environments when status query is invalid', async () => {
    try {
      const queryParams = {
        status: 'someInvalidStatus'
      };
      await adminSession.resources.environments.get(queryParams);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid environment status. Please try again with valid inputs.'
        })
      );
    }
  });

  test('list environments when status query is invalid', async () => {
    try {
      const queryParams = {
        status: 'someInvalidStatus'
      };
      await adminSession.resources.environments.listProjectEnvironments(queryParams);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid environment status. Please try again with valid inputs.'
        })
      );
    }
  });

  const validEnvStatuses = [
    'PENDING',
    'COMPLETED',
    'STARTING',
    'STOPPING',
    'STOPPED',
    'TERMINATING',
    'TERMINATED',
    'FAILED',
    'TERMINATING_FAILED',
    'STARTING_FAILED',
    'STOPPING_FAILED'
  ];

  test.each(validEnvStatuses)('list environments when status query is %s', async (status) => {
    const queryParams = {
      status
    };

    const { data: response } = await adminSession.resources.environments.get(queryParams);

    expect(Array.isArray(response.data)).toBe(true);
  });
});
