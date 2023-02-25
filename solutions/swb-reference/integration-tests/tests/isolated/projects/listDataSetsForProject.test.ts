/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
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
  let project1Id: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    paabHelper = new PaabHelper();
    const paabResources = await paabHelper.createResources();
    itAdminSession = paabResources.adminSession;
    researcher1Session = paabResources.rs1Session;
    pa1Session = paabResources.pa1Session;
    pa2Session = paabResources.pa2Session;
    project1Id = paabResources.project1Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('negative tests', () => {
    test('IT Admin cannot list datasets for a project', async () => {
      try {
        await itAdminSession.resources.projects.project(project1Id).dataSets().list();
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
        await pa2Session.resources.projects.project(project1Id).dataSets().list();
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

    test('Project Admin can list datasets for a project', async () => {
      const { data } = await pa1Session.resources.projects.project(project1Id).dataSets().list();

      expect(data.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: dataset1Id }),
          expect.objectContaining({ id: dataset2Id })
        ])
      );
      expect(data.data.length).toBe(2);
    });

    test('Researcher can list datasets for a project', async () => {
      const { data } = await researcher1Session.resources.projects.project(project1Id).dataSets().list();

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
        .list(1);

      expect(firstRequest.data).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: dataset1Id })])
      );
      expect(firstRequest.data.length).toBe(1);
      expect(firstRequest.paginationToken).toBeDefined();

      const { data: secondRequest } = await researcher1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .list(1, firstRequest.paginationToken);

      expect(secondRequest.data).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: dataset2Id })])
      );
      expect(secondRequest.data.length).toBe(1);
      expect(secondRequest.paginationToken).toBeDefined();

      const { data: lastRequest } = await researcher1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .list(1, secondRequest.paginationToken);

      expect(lastRequest.data).toStrictEqual([]);
      expect(lastRequest.paginationToken).toBeUndefined();
    });
  });
});
