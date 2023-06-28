/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateAccountRequest } from '@aws/workbench-core-accounts';
import { Account } from '@aws/workbench-core-accounts/lib/models/accounts/account';
import { AwsService, SecretsService } from '@aws/workbench-core-base';
import ClientSession from '../../support/clientSession';
import { AccountHelper } from '../../support/complex/accountHelper';
import Setup from '../../support/setup';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import Settings from '../../support/utils/settings';

describe('multiStep awsAccount integration test', () => {
  const setup: Setup = Setup.getSetup();
  const settings: Settings = setup.getSettings();
  const awsRegion = settings.get('awsRegion');
  const externalIdPath = settings.get('externalIdPath');
  const secretsService = new SecretsService(new AwsService({ region: awsRegion }).clients.ssm);
  let externalId: string;
  let adminSession: ClientSession;

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    externalId = await secretsService.getSecret(externalIdPath);
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('it works', async () => {
    const stackName = setup.getStackName();

    const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));

    const awsAccountIdToUse = settings.get('awsAccountId');
    const createAccountParams: CreateAccountRequest = {
      hostingAccountHandlerRoleArn: `arn:aws:iam::${awsAccountIdToUse}:role/${stackName}-hosting-account-role`,
      awsAccountId: awsAccountIdToUse,
      envMgmtRoleArn: `arn:aws:iam::${awsAccountIdToUse}:role/${stackName}-env-mgmt`,
      name: randomTextGenerator.getFakeText('fakeName'),
      externalId: externalId
    };

    const createResponse = await adminSession.resources.accounts.create(createAccountParams, false);
    expect(createResponse.status).toEqual(201);

    const accountId = createResponse.data.id;
    expect(accountId).toBeTruthy();

    const accountHelper = new AccountHelper();
    const doesBusAllowAccount = await accountHelper.verifyBusAllowsAccount(createAccountParams.awsAccountId);
    expect(doesBusAllowAccount).toBe(true);

    const hostingAccountTemplateResponse = await adminSession.resources.accounts.getHostingAccountTemplate(
      accountId
    );
    expect(hostingAccountTemplateResponse.status).toEqual(200);
    expect(Object.keys(hostingAccountTemplateResponse.data).length).toEqual(2); // Should get two sets of template URLs

    const listResponse = await adminSession.resources.accounts.get({ pageSize: `100` });
    expect(listResponse.status).toEqual(200);
    expect(listResponse.data.data.some((item: Account) => item.id === accountId)).toBe(true);

    const getResponse = await adminSession.resources.accounts.account(accountId).get();
    expect(getResponse.status).toEqual(200);
    expect(getResponse.data.id).toEqual(accountId);

    const dateString = new Date().toISOString().replace(/:/g, '');
    const name = `integrationTest${dateString}`;
    const updateResponse = await adminSession.resources.accounts.account(accountId).update({ name }, true);
    expect(updateResponse.status).toEqual(200);
    expect(updateResponse.data.name).toEqual(name);
  });
});
