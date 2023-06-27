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
  const paabHelper: PaabHelper = new PaabHelper(1);
  let itAdminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;
  let projectId: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    itAdminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
    projectId = paabResources.project1Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
    await setup.cleanup();
  });

  describe('ITAdmin tests', () => {
    test('list environments type configs executes successfully', async () => {
      const { data: response } = await itAdminSession.resources.environmentTypes
        .environmentType(envTypeId)
        .configurations()
        .get({});
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('Project Admin tests', () => {
    test('list environments type configs for project excecutes successfully', async () => {
      const { data: response } = await paSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .get({});
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('list environments type configs (non-project route) fails', async () => {
      try {
        await paSession.resources.environmentTypes.environmentType(envTypeId).configurations().get({});
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
    test('list environments type configs for project excecutes successfully', async () => {
      const { data: response } = await researcherSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .get({});
      expect(Array.isArray(response.data)).toBe(true);
    });

    test('list environments type configs (non-project route) fails', async () => {
      try {
        await researcherSession.resources.environmentTypes
          .environmentType(envTypeId)
          .configurations()
          .get({});
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
            .get(queryParams);
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

    // PA & Researcher must be through project route
    const testBundle = [
      {
        username: 'projectAdmin',
        session: () => paSession,
        projectId: () => projectId
      },
      {
        username: 'researcher',
        session: () => researcherSession,
        projectId: () => projectId
      }
    ];

    describe.each(testBundle)('for each user', (testCase) => {
      const { username, session: sessionFunc, projectId: projectFunc } = testCase;
      let session: ClientSession;
      let projectId: string;

      beforeEach(async () => {
        session = sessionFunc();
        projectId = projectFunc();
      });

      test(`it throws 400 error as ${username}`, async () => {
        try {
          await session.resources.projects
            .project(projectId)
            .environmentTypes()
            .environmentType(envTypeId)
            .configurations()
            .get(queryParams);
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

  test('Unauthenticated user cannot call list environments type configs (non-project route)', async () => {
    try {
      await anonymousSession.resources.environmentTypes.environmentType(envTypeId).configurations().get({});
    } catch (e) {
      checkHttpError(e, new HttpError(401, {}));
    }
  });
});
