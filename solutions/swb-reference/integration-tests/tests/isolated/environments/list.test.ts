/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import {
  JSONValue,
  betweenFilterMessage,
  lengthValidationMessage,
  nonEmptyMessage,
  urlFilterMaxLength
} from '@aws/swb-app';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError, generateRandomAlphaNumericString } from '../../../support/utils/utilities';

describe('list environments', () => {
  const paabHelper = new PaabHelper();
  let itAdminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let validProjectId: string;
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
    validProjectId = paabResources.project1Id;
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

    test('list environments with filter on empty name', async () => {
      try {
        await itAdminSession.resources.environments.get({ filter: { name: { eq: '' } } });
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

    test('list environments with filter createdAt between value1 > value2', async () => {
      try {
        await itAdminSession.resources.environments.get({
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

  describe('with invalid paginationToken', () => {
    const pagToken = '1';
    const queryParams = { paginationToken: pagToken };

    describe('as IT Admin', () => {
      test('it throws 400 error', async () => {
        try {
          await itAdminSession.resources.environments.get(queryParams);
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

    // PA & Researcher must be project environment route
    const testBundle = [
      {
        username: 'projectAdmin',
        session: () => paSession,
        projectId: () => validProjectId
      },
      {
        username: 'researcher',
        session: () => researcherSession,
        projectId: () => validProjectId
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
            .environments()
            .listProjectEnvironments(queryParams);
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
