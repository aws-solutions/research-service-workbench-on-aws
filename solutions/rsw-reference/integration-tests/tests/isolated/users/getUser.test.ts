/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('get user negative tests', () => {
  const paabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;
  let testUserId: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    ({ adminSession, pa1Session, rs1Session, anonymousSession } = await paabHelper.createResources(
      __filename
    ));
    testUserId = rs1Session.getUserId()!;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('boundary tests', () => {
    test('cannot list users if user is a researcher', async () => {
      try {
        await rs1Session.resources.users.user(testUserId).get();
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
        await anonymousSession.resources.users.user(testUserId).get();
      } catch (e) {
        checkHttpError(e, new HttpError(401, {}));
      }
    });

    test('can list users if user is a ITAdmin', async () => {
      await expect(adminSession.resources.users.user(testUserId).get()).resolves.not.toThrow();
    });

    test('can list users if user is a project admin', async () => {
      await expect(pa1Session.resources.users.user(testUserId).get()).resolves.not.toThrow();
    });
  });
});
