/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('get hosting account', () => {
  const setup: Setup = Setup.getSetup();
  const paabHelper: PaabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;
  let accountId: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    adminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
    accountId = setup.getSettings().get('defaultHostingAccountId');
  });

  afterAll(async () => {
    await paabHelper.cleanup();
    await setup.cleanup();
  });

  describe('with valid accountId', () => {
    describe('as IT Admin', () => {
      test('it returns account information', async () => {
        await expect(adminSession.resources.accounts.account(accountId).get()).resolves.not.toThrow();
      });
    });
  });

  describe('Project admin or researcher can not get aws Account', () => {
    describe('As project admin', () => {
      test('it throws 403 error', async () => {
        try {
          await paSession.resources.accounts.account(accountId).get();
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

    describe('As researcher', () => {
      test('it throws 403 error', async () => {
        try {
          await researcherSession.resources.accounts.account(accountId).get();
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

    describe('As unauthenticated user', () => {
      test('it throws 403 error', async () => {
        try {
          await anonymousSession.resources.accounts.account(accountId).get();
        } catch (e) {
          checkHttpError(e, new HttpError(401, {}));
        }
      });
    });
  });
});
