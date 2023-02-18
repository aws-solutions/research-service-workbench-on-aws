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

  describe('when updating an account', () => {
    let account: Account;

    beforeEach(() => {
      const accountId = `${resourceTypeToKey.account.toLowerCase()}-00000000-0000-0000-0000-000000000000`;
      account = adminSession.resources.accounts.account(accountId);
    });

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
});
