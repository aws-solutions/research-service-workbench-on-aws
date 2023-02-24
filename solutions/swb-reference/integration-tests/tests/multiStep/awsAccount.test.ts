/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AccountService, CreateAccountRequest } from '@aws/workbench-core-accounts';
import { Account } from '@aws/workbench-core-accounts/lib/models/accounts/account';
import { resourceTypeToKey } from '@aws/workbench-core-base';
import DynamoDBService from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/dynamoDBService';
import ClientSession from '../../support/clientSession';
import { AccountHelper } from '../../support/complex/accountHelper';
import Setup from '../../support/setup';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import Settings from '../../support/utils/settings';

describe('multiStep awsAccount integration test', () => {
  const setup: Setup = new Setup();
  const settings: Settings = setup.getSettings();
  let adminSession: ClientSession;

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('it works', async () => {
    const dynamoDbService = new DynamoDBService({
      region: settings.get('awsRegion'),
      table: setup.getStackName()
    });
    const accountService = new AccountService(dynamoDbService);

    const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));

    const createAccountParams: CreateAccountRequest = {
      hostingAccountHandlerRoleArn: settings.get('hostingAccountHandlerRoleArn'),
      awsAccountId: settings.get('hostAwsAccountId'),
      envMgmtRoleArn: settings.get('envMgmtRoleArn'),
      name: randomTextGenerator.getFakeText('fakeName'),
      externalId: 'workbench'
    };

    const hostingAwsAccountId = `${resourceTypeToKey.awsAccount}#${createAccountParams.awsAccountId}`;
    const query = { key: { name: 'pk', value: hostingAwsAccountId } };
    const ddbEntries = await dynamoDbService.getPaginatedItems(query);
    if (ddbEntries.data.length > 0) {
      const accountId = ddbEntries.data[0].accountId.toString();
      const awsAccountItemKey = {
        pk: hostingAwsAccountId,
        sk: `${resourceTypeToKey.account}#${accountId}`
      };
      await dynamoDbService.delete(awsAccountItemKey).execute();
    }

    const createResponse = await adminSession.resources.accounts.create(createAccountParams, false);
    expect(createResponse.status).toEqual(201);

    const accountId = createResponse.data.id;
    expect(accountId).toBeTruthy();

    expect(await new AccountHelper().verifyBusAllowsAccount(createAccountParams.awsAccountId)).toBe(true);

    const hostingAccountTemplateResponse = await adminSession.resources.accounts.getHostingAccountTemplate(
      accountId
    );
    expect(hostingAccountTemplateResponse.status).toEqual(200);

    const listResponse = await adminSession.resources.accounts.get({ pageSize: `100` });
    expect(listResponse.status).toEqual(200);
    expect(listResponse.data.data.some((item: Account) => item.id === accountId)).toBe(true);

    const getResponse = await adminSession.resources.accounts.account(accountId).get();
    expect(getResponse.status).toEqual(200);
    expect(getResponse.data.id).toEqual(accountId);

    const name = `integration-test-${new Date().toISOString()}`;
    const updateResponse = await adminSession.resources.accounts.account(accountId).update({ name }, true);
    expect(updateResponse.status).toEqual(200);
    expect(updateResponse.data.name).toEqual(name);

    await accountService.delete(accountId);
  });
});
