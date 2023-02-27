/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('list environments', () => {
  const paabHelper = new PaabHelper();
  let itAdminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  const validEnvStatuses = [
    'PENDING',
    'COMPLETED',
    'STARTING',
    'STOPPING',
    'STOPPED',
    'TERMINATING',
    'TERMINATED',
    'FAILED',
    'TERMINATING_FAILED',
    'STARTING_FAILED',
    'STOPPING_FAILED'
  ];

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources();
    itAdminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('IT Admin tests', () => {
    test('list environments when status query is invalid', async () => {
      try {
        const queryParams = {
          status: 'someInvalidStatus'
        };
        await itAdminSession.resources.environments.get(queryParams);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: 'Invalid environment status. Please try again with valid inputs.'
          })
        );
      }
    });

    test.each(validEnvStatuses)('list environments when status query is %s', async (status) => {
      const queryParams = {
        status
      };

      const { data: response } = await itAdminSession.resources.environments.get(queryParams);

      expect(Array.isArray(response.data)).toBe(true);
    });

    test('list project environments when project does not exist', async () => {
      const fakeProjectId: string = 'proj-12345678-1234-1234-1234-123456789012';
      try {
        await itAdminSession.resources.projects
          .project(fakeProjectId)
          .environments()
          .listProjectEnvironments();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Could not find project ${fakeProjectId}`
          })
        );
      }
    });
  });

  describe('Project Admin tests', () => {
    test('not authorized to call list environments', async () => {
      try {
        const queryParams = {
          status: 'someInvalidStatus'
        };
        await paSession.resources.environments.get(queryParams);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('list project environments when project does not exist', async () => {
      const fakeProjectId: string = 'proj-12345678-1234-1234-1234-123456789012';
      try {
        await paSession.resources.projects.project(fakeProjectId).environments().listProjectEnvironments();
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
    test('not authorized to call list environments', async () => {
      try {
        const queryParams = {
          status: 'someInvalidStatus'
        };
        await researcherSession.resources.environments.get(queryParams);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('list project environments when project does not exist', async () => {
      const fakeProjectId: string = 'proj-12345678-1234-1234-1234-123456789012';
      try {
        await researcherSession.resources.projects
          .project(fakeProjectId)
          .environments()
          .listProjectEnvironments();
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
});
