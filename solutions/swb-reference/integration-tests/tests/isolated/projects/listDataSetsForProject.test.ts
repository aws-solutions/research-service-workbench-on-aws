/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list users for project tests', () => {
  let paabHelper: PaabHelper;
  let adminSession: ClientSession;
  let researcherSession: ClientSession;
  let paSession: ClientSession;
  let projectId: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    paabHelper = new PaabHelper();
    const paabResources = await paabHelper.createResources();
    adminSession = paabResources.adminSession;
    researcherSession = paabResources.rs1Session;
    paSession = paabResources.pa1Session;
    projectId = paabResources.project1Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('negative tests', () => {
    test('project does not exist', async () => {
      const projectId = `${resourceTypeToKey.project.toLowerCase()}-00000000-0000-0000-0000-000000000000`;
      try {
        await adminSession.resources.projects.project(projectId).dataSets().list();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Could not find project ${projectId}`
          })
        );
      }
    });

    test('IT Admin cannot list datasets for a project', async () => {
      try {
        await adminSession.resources.projects.project(projectId).dataSets().list();
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
    test('Project Admin can list datasets for a project', async () => {
      const { data } = await paSession.resources.projects.project(projectId).dataSets().list();

      expect(data.data).toBe([]);
    });

    test('Researcher can list datasets for a project', async () => {
      const { data } = await researcherSession.resources.projects.project(projectId).dataSets().list();

      expect(data.data).toBe([]);
    });
  });
});
