/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list users negative tests', () => {
  const paabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    ({ adminSession, pa1Session, rs1Session, anonymousSession } = await paabHelper.createResources(
      __filename
    ));
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

  describe('boundary tests', () => {
    test('cannot list users if user is a researcher', async () => {
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

    test('cannot list users if user is unauthenticated', async () => {
      try {
        await anonymousSession.resources.users.get();
      } catch (e) {
        checkHttpError(e, new HttpError(401, {}));
      }
    });

    test('can list users if user is a ITAdmin', async () => {
      await expect(adminSession.resources.users.get()).resolves.not.toThrow();
    });

    test('can list users if user is a project admin', async () => {
      await expect(pa1Session.resources.users.get()).resolves.not.toThrow();
    });
  });
});
