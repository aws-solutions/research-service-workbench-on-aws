/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { MAX_API_PAGE_SIZE } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list datasets for project tests', () => {
  let paabHelper: PaabHelper;
  let itAdminSession: ClientSession;
  let researcher1Session: ClientSession;
  let pa1Session: ClientSession;
  let pa2Session: ClientSession;
  let anonymousSession: ClientSession;
  let project1Id: string;
  let project2Id: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    paabHelper = new PaabHelper(2);
    const paabResources = await paabHelper.createResources(__filename);
    itAdminSession = paabResources.adminSession;
    researcher1Session = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
    pa1Session = paabResources.pa1Session;
    pa2Session = paabResources.pa2Session;
    project1Id = paabResources.project1Id;
    project2Id = paabResources.project2Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('negative tests', () => {
    test('IT Admin gets 403', async () => {
      try {
        await itAdminSession.resources.projects.project(project1Id).dataSets().get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('Project Admin from project 2 cannot list datasets for project 1', async () => {
      try {
        await pa2Session.resources.projects.project(project1Id).dataSets().get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('Researcher from project 1 cannot list datasets for project 2', async () => {
      try {
        await researcher1Session.resources.projects.project(project2Id).dataSets().get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('Unauthenticated user cannot list datasets for project', async () => {
      try {
        await anonymousSession.resources.projects.project(project1Id).dataSets().get();
      } catch (e) {
        checkHttpError(e, new HttpError(401, {}));
      }
    });

    test('cannot have a page size of 0', async () => {
      try {
        await pa1Session.resources.projects.project(project1Id).dataSets().get({ pageSize: 0 });
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `pageSize: Must be Between 1 and ${MAX_API_PAGE_SIZE}`
          })
        );
      }
    });

    test('cannot have a page size of over the max', async () => {
      try {
        await pa1Session.resources.projects
          .project(project1Id)
          .dataSets()
          .get({ pageSize: MAX_API_PAGE_SIZE + 1 });
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `pageSize: Must be Between 1 and ${MAX_API_PAGE_SIZE}`
          })
        );
      }
    });
  });

  describe('basic tests', () => {
    let dataset1Id: string;
    let dataset2Id: string;

    beforeAll(async () => {
      const response1 = await pa1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .create(paabHelper.createDatasetRequest(project1Id), false);
      const response2 = await pa1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .create(paabHelper.createDatasetRequest(project1Id), false);

      dataset1Id = response1.data.id;
      dataset2Id = response2.data.id;
    });
    const invalidProjects: string[] = ['proj-123'];
    test.each(invalidProjects)('project id that does not exist', async (invalidProject) => {
      try {
        await itAdminSession.resources.projects.project(invalidProject).dataSets().get();
      } catch (error) {
        checkHttpError(
          error,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });
    test('Project Admin can list datasets for a project', async () => {
      const { data } = await pa1Session.resources.projects.project(project1Id).dataSets().get();

      expect(data.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: dataset1Id }),
          expect.objectContaining({ id: dataset2Id })
        ])
      );
      expect(data.data.length).toBe(2);
    });
    test('Researcher can list datasets for a project', async () => {
      const { data } = await researcher1Session.resources.projects.project(project1Id).dataSets().get();

      expect(data.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: dataset1Id }),
          expect.objectContaining({ id: dataset2Id })
        ])
      );
      expect(data.data.length).toBe(2);
    });

    test('listing datasets with pagination', async () => {
      const { data: firstRequest } = await researcher1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .get({ pageSize: 1 });

      expect(firstRequest.data).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: dataset1Id })])
      );
      expect(firstRequest.data.length).toBe(1);
      expect(firstRequest.paginationToken).toBeDefined();

      const { data: secondRequest } = await researcher1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .get({ pageSize: 1, paginationToken: firstRequest.paginationToken });

      expect(secondRequest.data).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: dataset2Id })])
      );
      expect(secondRequest.data.length).toBe(1);
      expect(secondRequest.paginationToken).toBeDefined();

      const { data: lastRequest } = await researcher1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .get({ pageSize: 1, paginationToken: secondRequest.paginationToken });

      expect(lastRequest.data).toStrictEqual([]);
      expect(lastRequest.paginationToken).toBeUndefined();
    });
  });

  describe('with invalid paginationToken', () => {
    const pagToken = '1';
    const queryParams = { paginationToken: pagToken };

    const testBundle = [
      {
        username: 'projectAdmin',
        session: () => pa1Session,
        projectId: () => project1Id
      },
      {
        username: 'researcher',
        session: () => researcher1Session,
        projectId: () => project1Id
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
          await session.resources.projects.project(projectId).dataSets().get(queryParams);
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
