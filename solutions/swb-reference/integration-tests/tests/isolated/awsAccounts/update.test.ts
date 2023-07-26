/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Account from '../../../support/resources/accounts/account';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('awsAccounts update negative tests', () => {
  const paabHelper: PaabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;
  let account: Account;
  const accountId = `${resourceTypeToKey.account.toLowerCase()}-00000000-0000-0000-0000-000000000000`;

  beforeEach(() => {
    expect.hasAssertions();
    account = adminSession.resources.accounts.account(accountId);
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    adminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('when updating an account', () => {
    describe('and the update params are invalid', () => {
      test('it throws a validation error', async () => {
        try {
          const surpriseIntValue = 1 as unknown as string;

          await account.update(
            {
              name: surpriseIntValue
            },
            true
          );
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'name: Expected string, received number'
            })
          );
        }
      });
    });
  });

  describe('Project admin or researcher can not update aws Account', () => {
    describe('As project admin', () => {
      test('it throws 403 error', async () => {
        try {
          await paSession.resources.accounts.account(accountId).update({ name: 'testName' }, true);
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
          await researcherSession.resources.accounts.account(accountId).update({ name: 'testName' }, true);
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
          await anonymousSession.resources.accounts.account(accountId).update({ name: 'testName' }, true);
        } catch (e) {
          checkHttpError(e, new HttpError(403, {}));
        }
      });
    });
  });
});
