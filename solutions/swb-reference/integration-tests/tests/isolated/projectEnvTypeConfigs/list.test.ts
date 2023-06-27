/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list environment type configs associated to project', () => {
  const paabHelper: PaabHelper = new PaabHelper(1);
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;
  const envTypeId = setup.getSettings().get('envTypeId');
  const nonExistentProjectId = 'proj-12345678-1234-1234-1234-123456789012';
  const nonExistentEnvTypeId = 'et-prod-0123456789012,pa-0123456789012';
  let projectId: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    adminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
    projectId = paabResources.project1Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  test('list projectEnvTypeConfigs executes successfully', async () => {
    const { data: response } = await adminSession.resources.projects
      .project(projectId)
      .environmentTypes()
      .environmentType(envTypeId)
      .configurations()
      .get({});
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('list projectEnvTypeConfigs fails when using invalid format project Id', async () => {
    try {
      await adminSession.resources.projects
        .project('invalid-project-id')
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .get({});
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `projectId: Invalid ID`
        })
      );
    }
  });

  test('list projectEnvTypeConfigs fails when using non existing project Id', async () => {
    try {
      await adminSession.resources.projects
        .project(nonExistentProjectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .get({});
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find project`
        })
      );
    }
  });

  test('list projectEnvTypeConfigs fails when using invalid format envType Id', async () => {
    try {
      await adminSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType('invalid-envType-id')
        .configurations()
        .get({});
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `envTypeId: Invalid ID`
        })
      );
    }
  });

  test('list projectEnvTypeConfigs fails when using non existing envType Id', async () => {
    try {
      await adminSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(nonExistentEnvTypeId)
        .configurations()
        .get({});
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          error: 'Not Found',
          message: `Could not find environment type`
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
          await adminSession.resources.environmentTypes
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

  describe('Researcher test', () => {
    test('cannot list ETCs for project where researcher is not a part of the project', async () => {
      try {
        await researcherSession.resources.projects
          .project('proj-30a71a7a-f450-4188-941c-de1482e4dd92')
          .environmentTypes()
          .environmentType(envTypeId)
          .configurations()
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

  describe('Project Admin test', () => {
    test('cannot list ETCs for project where Project Admin is not a part of the project', async () => {
      try {
        await paSession.resources.projects
          .project('proj-30a71a7a-f450-4188-941c-de1482e4dd92')
          .environmentTypes()
          .environmentType(envTypeId)
          .configurations()
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

  test('Unauthenticated user cannot list ETCs', async () => {
    try {
      await anonymousSession.resources.projects
        .project('proj-30a71a7a-f450-4188-941c-de1482e4dd92')
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .get();
    } catch (e) {
      checkHttpError(e, new HttpError(401, {}));
    }
  });
});
