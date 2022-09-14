/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import ClientSession from '../../support/clientSession';
import { AccountHelper } from '../../support/complex/accountHelper';
import Setup from '../../support/setup';
import Settings, { SettingKey } from '../../support/utils/settings';

describe('multiStep aws-account integration test', () => {
  const setup: Setup = new Setup();
  const settings: Settings = setup.getSettings();
  let adminSession: ClientSession;

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  function canTestAccountsApi(): boolean {
    const settings = setup.getSettings();
    const requiredSettings = ['hostAwsAccountId', 'envMgmtRoleArn', 'hostingAccountHandlerRoleArn', 
    'encryptionKeyArn', 'S3BucketArtifactsArnOutput'];

    // Check if all configs exist in given config
    return _.every(requiredSettings, setting => {
      let currConfig;
      try{
        currConfig = settings.get(setting as SettingKey);
      } catch(e){
        // Nothing to do here.
      }
      return currConfig;
    });
  }

  test('Onboarding new hosting account', async () => {
    if (!canTestAccountsApi()) {
      console.log('Config settings needed to test AWS Account onboarding are missing. Skipping this test')
      return;
    }

    const accountHelper = new AccountHelper(setup.getMainAwsClient());
    const artifactsBucketName = settings.get('S3BucketArtifactsArnOutput').split(':').pop();
    
    // Create account
    const accountCreateBody = {
      awsAccountId: settings.get('hostAwsAccountId'),
      envMgmtRoleArn: settings.get('envMgmtRoleArn'),
      hostingAccountHandlerRoleArn: settings.get('hostingAccountHandlerRoleArn'),
      environmentInstanceFiles: `s3://${artifactsBucketName}/environment-files`,
      encryptionKeyArn: settings.get('encryptionKeyArn')
    };

    const {data: account} = await adminSession.resources.accounts.create(accountCreateBody);
    expect(account).toMatchObject(accountCreateBody);
    expect(await accountHelper.verifyBusPermitsAccount(account.awsAccountId)).toBe(true);
  });
});
