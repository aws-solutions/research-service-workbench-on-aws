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

describe('aws-accounts create negative tests', () => {
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
    environmentInstanceFiles: randomTextGenerator.getFakeText('fakeEnvironmentInstanceFiles'),
    encryptionKeyArn: randomTextGenerator.getFakeText('fakeEncryptionKeyArn')
  };

  describe('Account already onboarded', () => {
    test('awsAccountId', async () => {
      const accountHelper = new AccountHelper(setup.getMainAwsClient());
      const invalidParam: { [id: string]: string } = { ...validLaunchParameters };
      const existingAccounts = await accountHelper.listOnboardedAccounts();

      if (existingAccounts.length === 0) {
        console.log('No hosting accounts have been onboarded. Skipping this test.');
        return;
      }

      const existingAwsAccountId = _.first(existingAccounts)!.awsAccountId;
      invalidParam.awsAccountId = existingAwsAccountId;
      try {
        await adminSession.resources.accounts.create(invalidParam, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'This AWS Account was found in DDB. Please provide the correct id value in request body'
          })
        );
      }
    });
  });
});
