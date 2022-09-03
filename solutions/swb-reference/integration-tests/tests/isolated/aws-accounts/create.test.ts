/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
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
      try {
        const invalidParam: { [id: string]: string } = { ...validLaunchParameters };
        const existingAwsAccountId = await adminSession.resources.accounts.getOnboardedAccount();
        invalidParam.awsAccountId = existingAwsAccountId;
        await adminSession.resources.accounts.create(invalidParam, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'Bad Request',
            message: "requires property 'datasetName'"
          })
        );
      }
    });
  });
});
