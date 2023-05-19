/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { lengthValidationMessage, urlFilterMaxLength } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError, generateRandomAlphaNumericString } from '../../../support/utils/utilities';

describe('list environment types', () => {
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  const paabHelper = new PaabHelper();
  let itAdminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    const paabResources = await paabHelper.createResources();
    itAdminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('list environments types when filter and sorting by name', async () => {
    const { data: response } = await adminSession.resources.environmentTypes.get({
      filter: {
        name: { begins: 'Sage' }
      },
      sort: {
        name: 'desc'
      }
    });
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('list environments types when filter and sorting by status', async () => {
    const { data: response } = await adminSession.resources.environmentTypes.get({
      filter: {
        status: { begins: 'NOT' }
      },
      sort: {
        status: 'desc'
      }
    });
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('list environments types fails when filter by invalid prop', async () => {
    try {
      await adminSession.resources.environmentTypes.get({
        filter: {
          someProperty: { begins: 'NOT' }
        }
      });
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: "filter: Unrecognized key(s) in object: 'someProperty'"
        })
      );
    }
  });

  test('list environments types fails when filter and sorting different props', async () => {
    try {
      await adminSession.resources.environmentTypes.get({
        filter: {
          status: { begins: 'NOT' }
        },
        sort: {
          name: 'desc'
        }
      });
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: 'Cannot apply a filter and sort to different properties at the same time'
        })
      );
    }
  });
  test('list environments types fails when filter by name exceeding length', async () => {
    try {
      await adminSession.resources.environmentTypes.get({
        filter: {
          name: { begins: generateRandomAlphaNumericString(urlFilterMaxLength + 1) }
        }
      });
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `filter.name.begins: ${lengthValidationMessage(urlFilterMaxLength)}`
        })
      );
    }
  });

  describe('with invalid paginationToken', () => {
    const pagToken = '1';
    const queryParams = { paginationToken: pagToken };

    describe('as IT Admin', () => {
      test('it throws 400 error', async () => {
        try {
          await itAdminSession.resources.environmentTypes.get(queryParams);
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
          await session.resources.environmentTypes.get(queryParams);
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
