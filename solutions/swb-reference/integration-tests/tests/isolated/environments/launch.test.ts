/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

describe('environments launch negative tests', () => {
  const paabHelper: PaabHelper = new PaabHelper(2);
  const setup: Setup = Setup.getSetup();
  let itAdminSession: ClientSession;
  let pa1Session: ClientSession;
  let project1Id: string;
  let project2Id: string;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));
  const validLaunchParameters = {
    name: randomTextGenerator.getFakeText('name'),
    description: randomTextGenerator.getFakeText('description'),
    envTypeId: setup.getSettings().get('envTypeId'),
    envTypeConfigId: setup.getSettings().get('envTypeConfigId'),
    datasetIds: [],
    envType: setup.getSettings().get('envType')
  };

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    itAdminSession = paabResources.adminSession;
    pa1Session = paabResources.pa1Session;
    project1Id = paabResources.project1Id;
    project2Id = paabResources.project2Id;
    researcherSession = paabResources.rs1Session;
    anonymousSession = await setup.createAnonymousSession();
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('403 error is thrown when', () => {
    test('IT Admin launch environment', async () => {
      try {
        await itAdminSession.resources.projects
          .project(project1Id)
          .environments()
          .create(validLaunchParameters, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('Project admin launch environment under project they are not associated with', async () => {
      try {
        await pa1Session.resources.projects
          .project(project2Id)
          .environments()
          .create(validLaunchParameters, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('Researcher launch environment under project they are not associated with', async () => {
      try {
        await researcherSession.resources.projects
          .project(project2Id)
          .environments()
          .create(validLaunchParameters, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized'
          })
        );
      }
    });

    test('Unauthenticated user cannot launch environment', async () => {
      try {
        await anonymousSession.resources.projects
          .project(project1Id)
          .environments()
          .create(validLaunchParameters, false);
      } catch (e) {
        checkHttpError(e, new HttpError(403, {}));
      }
    });
  });

  describe('missing parameters', () => {
    describe('ProjectAdmin tests', () => {
      test('name', async () => {
        try {
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          delete invalidParam.name;
          await pa1Session.resources.projects.project(project1Id).environments().create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'name: Required'
            })
          );
        }
      });
      test('envTypeId', async () => {
        try {
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          delete invalidParam.envTypeId;
          await pa1Session.resources.projects.project(project1Id).environments().create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'envTypeId: Required'
            })
          );
        }
      });
      test('envTypeConfigId', async () => {
        try {
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          delete invalidParam.envTypeConfigId;
          await pa1Session.resources.projects.project(project1Id).environments().create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'envTypeConfigId: Required'
            })
          );
        }
      });
      test('envType', async () => {
        try {
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          delete invalidParam.envType;
          await pa1Session.resources.projects.project(project1Id).environments().create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'envType: Required'
            })
          );
        }
      });
      test('description', async () => {
        try {
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          delete invalidParam.description;
          await pa1Session.resources.projects.project(project1Id).environments().create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'description: Required'
            })
          );
        }
      });
      test('all parameters', async () => {
        try {
          await pa1Session.resources.projects.project(project1Id).environments().create({}, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message:
                'name: Required. description: Required. envTypeId: Required. envTypeConfigId: Required. envType: Required'
            })
          );
        }
      });
      test('fails when trying to create with invalid environment type id format', async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          invalidParam.envTypeId = 'wrong-id-format';
          await pa1Session.resources.projects.project(project1Id).environments().create(invalidParam, false);
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
      test('fails when trying to create with invalid environment type config id format', async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          invalidParam.envTypeConfigId = 'wrong-id-format';
          await pa1Session.resources.projects.project(project1Id).environments().create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `envTypeConfigId: Invalid ID`
            })
          );
        }
      });
      test('error when project does not exist', async () => {
        const fakeProjectId: string = 'proj-12345678-1234-1234-1234-123456789012';
        try {
          await pa1Session.resources.projects.project(fakeProjectId).environments().create({});
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
      test('name', async () => {
        try {
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          delete invalidParam.name;
          await researcherSession.resources.projects
            .project(project1Id)
            .environments()
            .create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'name: Required'
            })
          );
        }
      });
      test('envTypeId', async () => {
        try {
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          delete invalidParam.envTypeId;
          await researcherSession.resources.projects
            .project(project1Id)
            .environments()
            .create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'envTypeId: Required'
            })
          );
        }
      });
      test('envTypeConfigId', async () => {
        try {
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          delete invalidParam.envTypeConfigId;
          await researcherSession.resources.projects
            .project(project1Id)
            .environments()
            .create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'envTypeConfigId: Required'
            })
          );
        }
      });
      test('envType', async () => {
        try {
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          delete invalidParam.envType;
          await researcherSession.resources.projects
            .project(project1Id)
            .environments()
            .create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'envType: Required'
            })
          );
        }
      });
      test('description', async () => {
        try {
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          delete invalidParam.description;
          await researcherSession.resources.projects
            .project(project1Id)
            .environments()
            .create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: 'description: Required'
            })
          );
        }
      });
      test('all parameters', async () => {
        try {
          await researcherSession.resources.projects.project(project1Id).environments().create({}, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message:
                'name: Required. description: Required. envTypeId: Required. envTypeConfigId: Required. envType: Required'
            })
          );
        }
      });
      test('fails when trying to create with invalid environment type id format', async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          invalidParam.envTypeId = 'wrong-id-format';
          await researcherSession.resources.projects
            .project(project1Id)
            .environments()
            .create(invalidParam, false);
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
      test('fails when trying to create with invalid environment type config id format', async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          invalidParam.envTypeConfigId = 'wrong-id-format';
          await researcherSession.resources.projects
            .project(project1Id)
            .environments()
            .create(invalidParam, false);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              error: 'Bad Request',
              message: `envTypeConfigId: Invalid ID`
            })
          );
        }
      });
      test('error when project does not exist', async () => {
        const fakeProjectId: string = 'proj-12345678-1234-1234-1234-123456789012';
        try {
          await researcherSession.resources.projects.project(fakeProjectId).environments().create({});
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
});
