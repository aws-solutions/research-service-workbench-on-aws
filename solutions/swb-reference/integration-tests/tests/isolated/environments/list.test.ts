/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import {
  lengthValidationMessage,
  urlFilterMaxLength,
  JSONValue,
  nonEmptyMessage,
  betweenFilterMessage
} from '@aws/workbench-core-base';
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError, generateRandomAlphaNumericString } from '../../../support/utils/utilities';

describe('list environments', () => {
  const paabHelper = new PaabHelper(2);
  let itAdminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;
  let projectId1: string;
  let projectId2: string;
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
    const paabResources = await paabHelper.createResources(__filename);
    itAdminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    projectId1 = paabResources.project1Id;
    projectId2 = paabResources.project2Id;
    rs1Session = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
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

    describe('page size too large', () => {
      const pageSize = '101';
      const queryParams = { pageSize };

      test('it throws 400 error', async () => {
        try {
          await itAdminSession.resources.environments.get(queryParams);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `pageSize: Must be Between 1 and 100`
            })
          );
        }
      });
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
            message: `Could not find project`
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

    test('list project environments when user not associated to a valid project', async () => {
      console.log('A Project Admin of Project1 and Project3, cannot LIST environments from Project2');
      try {
        await paSession.resources.projects.project(projectId2).environments().listProjectEnvironments();
        throw new Error('Listing project environments with unauthorized user did not throw an error');
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

  describe('page size too large', () => {
    const pageSize = '101';
    const queryParams = { pageSize };

    test('it throws 400 error', async () => {
      try {
        await itAdminSession.resources.projects
          .project(projectId2)
          .environments()
          .listProjectEnvironments(queryParams);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `pageSize: Must be Between 1 and 100`
          })
        );
      }
    });
  });

  describe('Researcher tests', () => {
    test('list project environments when user not associated to a valid project', async () => {
      console.log('A Researcher of Project1 and Project3, cannot LIST environments from Project2');
      try {
        await rs1Session.resources.projects.project(projectId2).environments().listProjectEnvironments();
        throw new Error('Listing project environments with unauthorized user did not throw an error');
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

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
              message: `Invalid Pagination Token`
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
        projectId: () => projectId1
      },
      {
        username: 'researcher',
        session: () => researcherSession,
        projectId: () => projectId1
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
              message: `Invalid Pagination Token`
            })
          );
        }
      });
    });
  });

  test('Unauthenticated user not authorized to call list environments', async () => {
    try {
      await anonymousSession.resources.environments.get({});
    } catch (e) {
      checkHttpError(e, new HttpError(401, {}));
    }
  });
});
