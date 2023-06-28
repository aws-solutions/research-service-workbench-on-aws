/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { nonEmptyMessage } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('List Cost Center negative tests', () => {
  const setup: Setup = Setup.getSetup();
  const paabHelper: PaabHelper = new PaabHelper(1);
  let itAdminSession: ClientSession;
  let pa1Session: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;
  const forbiddenHttpError = new HttpError(403, { error: 'User is not authorized' });
  const unauthorizedHttpError = new HttpError(401, {});

  beforeEach(async () => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    itAdminSession = paabResources.adminSession;
    pa1Session = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
    await setup.cleanup();
  });

  describe('authorization test:', () => {
    let costCenterId: string;

    beforeAll(async () => {
      const accountId = setup.getSettings().get('defaultHostingAccountId');
      const { data: costCenter } = await itAdminSession.resources.costCenters.create({
        accountId,
        name: 'costCenterIntegTest'
      });

      costCenterId = costCenter.id;
    });

    afterAll(async () => {
      await itAdminSession.resources.costCenters.costCenter(costCenterId).delete();
    });

    test('ITAdmin can list Cost Centers', async () => {
      const response = await itAdminSession.resources.costCenters.get();

      expect(response.status).toEqual(200);
    });

    test('ProjectAdmin cannot list Cost Centers', async () => {
      await expect(pa1Session.resources.costCenters.get()).rejects.toThrow(forbiddenHttpError);
    });

    test('Researcher cannot list Cost Centers', async () => {
      await expect(researcherSession.resources.costCenters.get()).rejects.toThrow(forbiddenHttpError);
    });

    test('Unauthenticated user cannot list Cost Centers', async () => {
      await expect(anonymousSession.resources.costCenters.get()).rejects.toThrow(unauthorizedHttpError);
    });
  });

  describe('with filter', () => {
    describe('with name that is empty', () => {
      beforeEach(async () => {});

      test('it throws 400 error', async () => {
        try {
          await itAdminSession.resources.costCenters.get({
            filter: { name: { eq: '' } }
          });
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `filter.name.eq: ${nonEmptyMessage}`
            })
          );
        }
      });
    });
  });

  describe('with invalid paginationToken', () => {
    const pagToken = '1';
    const queryParams = { paginationToken: pagToken };

    describe('as IT Admin', () => {
      test('it throws 400 error', async () => {
        try {
          await itAdminSession.resources.costCenters.get(queryParams);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `Invalid Pagination Token`
            })
          );
        }
      });
    });
  });
});
