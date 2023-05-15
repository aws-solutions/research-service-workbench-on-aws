/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list projects', () => {
  const paabHelper: PaabHelper = new PaabHelper();
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources();
    adminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('with invalid paginationToken', () => {
    const pagToken = '1';
    const queryParams = { paginationToken: pagToken };

    describe('as IT Admin', () => {
      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.projects.get(queryParams);
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

    const testBundle = [
      {
        username: 'projectAdmin',
        session: () => paSession
      },
      {
        username: 'researcher',
        session: () => researcherSession
      }
    ];

    describe.each(testBundle)('for each user', (testCase) => {
      const { username, session: sessionFunc } = testCase;
      let session: ClientSession;

      beforeEach(async () => {
        session = sessionFunc();
      });

      test(`it throws 400 error as ${username}`, async () => {
        try {
          await session.resources.projects.get(queryParams);
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
