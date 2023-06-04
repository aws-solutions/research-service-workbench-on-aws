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
  const setup: Setup = Setup.getSetup();
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
    awsAccountId: '123456789012',
    envMgmtRoleArn: `arn:aws:iam::123456789012:role/${randomTextGenerator.getFakeText(
      'fakeEnvMgmtRoleArn'
    )}-env-mgmt`,
    hostingAccountHandlerRoleArn: `arn:aws:iam::123456789012:role/${randomTextGenerator.getFakeText(
      'fakeHostingAccountHandlerRoleArn'
    )}-hosting-account-role`,
    name: randomTextGenerator.getFakeText('fakeName'),
    externalId: randomTextGenerator.getFakeText('fakeExternalId')
  };

  describe('when creating an account', () => {
    describe('and the creation params are invalid', () => {
      test('with empty body it throws a validation error', async () => {
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
      test('with accountId that is too long it throws a validation error', async () => {
        try {
          const body = { ...validLaunchParameters };
          body.awsAccountId = '123456789012345';
          await adminSession.resources.accounts.create(body, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'awsAccountId: must be a 12 digit number'
            })
          );
        }
      });
      test('with accountId of account that does not exist it throws a validation error', async () => {
        try {
          const body = { ...validLaunchParameters };
          body.awsAccountId = '123456789012';
          await adminSession.resources.accounts.create(body, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: "Please provide a valid 'awsAccountId' for the hosting account"
            })
          );
        }
      });
      test('with incorrect envMgtmRoleArn and hostingAccountHandlerRoleArn it throws a validation error', async () => {
        try {
          const body = { ...validLaunchParameters };
          body.envMgmtRoleArn = 'fakeValue';
          body.hostingAccountHandlerRoleArn = 'fakeValue';
          await adminSession.resources.accounts.create(body, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message:
                'envMgmtRoleArn: must be a valid envMgmtRoleArn. hostingAccountHandlerRoleArn: must be a valid hostingAccountHandlerRoleArn'
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
