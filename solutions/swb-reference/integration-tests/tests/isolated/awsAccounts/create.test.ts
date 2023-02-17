/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import _ from 'lodash';
import ClientSession from '../../../support/clientSession';
import { AccountHelper } from '../../../support/complex/accountHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

describe('awsAccounts create negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  const validLaunchParameters = {
    awsAccountId: randomTextGenerator.getFakeText('fakeAccount'),
    envMgmtRoleArn: randomTextGenerator.getFakeText('fakeEnvMgmtRoleArn'),
    hostingAccountHandlerRoleArn: randomTextGenerator.getFakeText('fakeHostingAccountHandlerRoleArn'),
    name: randomTextGenerator.getFakeText('fakeName'),
    externalId: randomTextGenerator.getFakeText('fakeExternalId')
  };

  describe('when creating an account', () => {
    describe('and the creation params are invalid', () => {
      test('it throws a validation error', async () => {
        try {
          await adminSession.resources.accounts.create({}, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message:
                'name: Required. awsAccountId: Required. envMgmtRoleArn: Required. hostingAccountHandlerRoleArn: Required. externalId: Required'
            })
          );
        }
      });
    });
    describe('and the account is already onboarded', () => {
      test('it throws an error', async () => {
        const accountHelper = new AccountHelper();
        const invalidParam: { [id: string]: string } = { ...validLaunchParameters };
        const existingAccounts = await accountHelper.listOnboardedAccounts();

        invalidParam.awsAccountId = _.first(existingAccounts)!.awsAccountId;
        try {
          await adminSession.resources.accounts.create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message:
                'This AWS Account was found in DDB. Please provide the correct id value in request body'
            })
          );
        }
      });
    });
  });
});
