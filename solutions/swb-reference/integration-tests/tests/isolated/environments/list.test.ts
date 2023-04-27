/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { lengthValidationMessage, urlFilterMaxLength, JSONValue } from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError, generateRandomAlphaNumericString } from '../../../support/utils/utilities';

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

  const invalidFilters = [
    {
      queryParams: { filter: { status: { eq: generateRandomAlphaNumericString(urlFilterMaxLength + 1) } } },
      message: `filter.status.eq: ${lengthValidationMessage(urlFilterMaxLength)}`
    },
    {
      queryParams: { filter: { name: { eq: generateRandomAlphaNumericString(urlFilterMaxLength + 1) } } },
      message: `filter.name.eq: ${lengthValidationMessage(urlFilterMaxLength)}`
    },
    {
      queryParams: {
        filter: { createdAt: { eq: generateRandomAlphaNumericString(urlFilterMaxLength + 1) } }
      },
      message: `filter.createdAt.eq: ${lengthValidationMessage(urlFilterMaxLength)}`
    },
    {
      queryParams: { filter: { owner: { eq: generateRandomAlphaNumericString(urlFilterMaxLength + 1) } } },
      message: `filter.owner.eq: ${lengthValidationMessage(urlFilterMaxLength)}`
    },
    {
      queryParams: {
        filter: { projectId: { eq: generateRandomAlphaNumericString(urlFilterMaxLength + 1) } }
      },
      message: `filter.projectId.eq: ${lengthValidationMessage(urlFilterMaxLength)}`
    }
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
    test.each(invalidFilters)(
      'list environments fails with invalid filter exceeding filter length',
      async (invalidFilter) => {
        try {
          await itAdminSession.resources.environments.get(
            invalidFilter.queryParams as unknown as Record<string, JSONValue>
          ); //undefined values are not accepted by Json value
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: invalidFilter.message
            })
          );
        }
      }
    );

    test.each(validEnvStatuses)('list environments when status query is %s', async (status) => {
      const queryParams = {
        filter: { status: { eq: status } }
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
          filter: { status: { eq: 'someInvalidStatus' } }
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
          filter: { status: { eq: 'someInvalidStatus' } }
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
