/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('awsAccountTemplateUrls tests', () => {
  const mockExternalId = 'workbench-integration-test';
  const paabHelper: PaabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    adminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
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
  });

  describe('As project admin', () => {
    test('it throws 403 error', async () => {
      try {
        await paSession.resources.accounts.getHostingAccountTemplate(mockExternalId);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    describe('As researcher', () => {
      test('it throws 403 error', async () => {
        try {
          await researcherSession.resources.accounts.getHostingAccountTemplate(mockExternalId);
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
  });

  describe('As unauthenticated user', () => {
    test('it throws 403 error', async () => {
      try {
        await anonymousSession.resources.accounts.getHostingAccountTemplate(mockExternalId);
      } catch (e) {
        checkHttpError(e, new HttpError(403, {}));
      }
    });
  });
});
