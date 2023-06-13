/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list environment type configs', () => {
  const setup: Setup = Setup.getSetup();
  const envTypeId = setup.getSettings().get('envTypeId');
  const envTypeConfigId = setup.getSettings().get('envTypeConfigId');
  const paabHelper: PaabHelper = new PaabHelper();
  let itAdminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    itAdminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
    await setup.cleanup();
  });

  describe('ITAdmin tests', () => {
    test('list projects by environments type config executes successfully', async () => {
      const { data: response } = await itAdminSession.resources.environmentTypes
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .projects()
        .get();
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('Project Admin tests', () => {
    test('list projects by environments type config throws 403', async () => {
      try {
        await paSession.resources.environmentTypes
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .projects()
          .get();
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

  describe('Researcher tests', () => {
    test('list projects by environments type config throws 403', async () => {
      try {
        await researcherSession.resources.environmentTypes
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .projects()
          .get();
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

  describe('with invalid paginationToken', () => {
    const pagToken = '1';
    const queryParams = { paginationToken: pagToken };

    describe('as IT Admin', () => {
      test('it throws 400 error', async () => {
        try {
          await itAdminSession.resources.environmentTypes
            .environmentType(envTypeId)
            .configurations()
            .environmentTypeConfig(envTypeConfigId)
            .projects()
            .get(queryParams);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `Invalid Pagination Token: ${queryParams.paginationToken}`
            })
          );
        }
      });
    });
  });
});
