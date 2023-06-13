/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list users negative tests', () => {
  const paabHelper = new PaabHelper(0);
  let adminSession: ClientSession;
  let rs1Session: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    ({ adminSession, rs1Session } = await paabHelper.createResources(__filename));
  });

  afterAll(async () => {
    await paabHelper.cleanup();
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
              message: 'Invalid parameter'
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

  it('Researcher: should return 403 error when try to list users', async () => {
    try {
      await rs1Session.resources.users.get();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });
});
