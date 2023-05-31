/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list users negative tests', () => {
  const setup: Setup = Setup.getSetup();
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

  describe('with invalid parameters', () => {
    describe('--non encoded pagination token', () => {
      const paginationToken = 'invalidPaginationToken123';
      const queryParams = { paginationToken };

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.users.get(queryParams);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'Invalid Pagination Token'
            })
          );
        }
      });
    });

    describe('--non number page size', () => {
      const pageSize = 'one';
      const queryParams = { pageSize };

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.users.get(queryParams);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `pageSize: Must be a number`
            })
          );
        }
      });
    });

    describe('--page size too small', () => {
      const pageSize = '0';
      const queryParams = { pageSize };

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.users.get(queryParams);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `pageSize: Must be Between 1 and 100`
            })
          );
        }
      });
    });

    describe('--page size too large', () => {
      const pageSize = '110';
      const queryParams = { pageSize };

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.users.get(queryParams);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `pageSize: Must be Between 1 and 100`
            })
          );
        }
      });
    });
  });
});
