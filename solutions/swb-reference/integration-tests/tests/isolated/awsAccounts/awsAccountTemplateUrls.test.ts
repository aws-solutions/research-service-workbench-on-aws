/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';

describe('awsAccountTemplateUrls tests', () => {
  const mockExternalId = 'workbench-integration-test';
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

  it('returns all six expected URLs when called.', async () => {
    const response = await adminSession.resources.accounts.getHostingAccountTemplate(mockExternalId);
    const urls = response.data;

    expect(urls).toBeDefined();
    const onboardUrls = _.get(urls, 'onboard-account');
    expect(onboardUrls.createUrl).toBeTruthy();
    expect(onboardUrls.updateUrl).toBeTruthy();
    const byonUrls = _.get(urls, 'onboard-account-byon');
    expect(byonUrls.createUrl).toBeTruthy();
    expect(byonUrls.updateUrl).toBeTruthy();
    const tgwUrls = _.get(urls, 'onboard-account-tgw');
    expect(tgwUrls.createUrl).toBeTruthy();
    expect(tgwUrls.updateUrl).toBeTruthy();
  });
});
