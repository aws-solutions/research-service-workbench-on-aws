/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { nonEmptyMessage, betweenFilterMessage } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('List Project negative tests', () => {
  const paabHelper: PaabHelper = new PaabHelper();
  let adminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;

  beforeEach(async () => {
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

  describe('with filter', () => {
    describe('with name that is empty', () => {
      beforeEach(async () => {});

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.projects.get({
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

    describe('with createdAt', () => {
      beforeEach(async () => {});
      describe('with value1 > value2', () => {
        test('it throws 400 error', async () => {
          try {
            await adminSession.resources.projects.get({
              filter: {
                createdAt: {
                  between: {
                    value1: '2023-05-14T07:23:39.311Z',
                    value2: '2023-05-11T07:23:39.311Z'
                  }
                }
              }
            });
          } catch (e) {
            checkHttpError(
              e,
              new HttpError(400, {
                error: 'Bad Request',
                message: `filter.createdAt.between: ${betweenFilterMessage}`
              })
            );
          }
        });
      });
    });
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
              message: `Invalid Pagination Token`
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
              message: `Invalid Pagination Token`
            })
          );
        }
      });
    });

    test('Unauthenticated user gets 401', async () => {
      try {
        await anonymousSession.resources.projects.get();
      } catch (e) {
        checkHttpError(e, new HttpError(401, {}));
      }
    });
  });
});
