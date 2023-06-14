/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import Account from '../../../support/resources/accounts/account';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('awsAccounts update negative tests', () => {
  const setup: Setup = Setup.getSetup();
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
    adminSession = await setup.getDefaultAdminSession();
    paSession = await setup.getSessionForUserType('projectAdmin1');
    researcherSession = await setup.getSessionForUserType('researcher1');
    anonymousSession = await setup.createAnonymousSession();
  });

  afterAll(async () => {
    await setup.cleanup();
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

    describe('As unauthorized user', () => {
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
