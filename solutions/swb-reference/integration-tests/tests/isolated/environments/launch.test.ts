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
  const paabHelper: PaabHelper = new PaabHelper();
  const setup: Setup = Setup.getSetup();
  let itAdminSession: ClientSession;
  let paSession: ClientSession;
  let projectId: string;
  let researcherSession: ClientSession;
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
    paSession = paabResources.pa1Session;
    projectId = paabResources.project1Id;
    researcherSession = paabResources.rs1Session;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('ITAdmin tests', () => {
    test('Unable to launch', async () => {
      try {
        await itAdminSession.resources.projects
          .project(projectId)
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
  });

  describe('missing parameters', () => {
    describe('ProjectAdmin tests', () => {
      test('name', async () => {
        try {
          //eslint-disable-next-line @typescript-eslint/no-explicit-any
          const invalidParam: any = { ...validLaunchParameters };
          delete invalidParam.name;
          await paSession.resources.projects.project(projectId).environments().create(invalidParam, false);
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
          await paSession.resources.projects.project(projectId).environments().create(invalidParam, false);
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
          await paSession.resources.projects.project(projectId).environments().create(invalidParam, false);
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
          await paSession.resources.projects.project(projectId).environments().create(invalidParam, false);
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
          await paSession.resources.projects.project(projectId).environments().create(invalidParam, false);
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
          await paSession.resources.projects.project(projectId).environments().create({}, false);
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
          await paSession.resources.projects.project(projectId).environments().create(invalidParam, false);
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
          await paSession.resources.projects.project(projectId).environments().create(invalidParam, false);
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
          await paSession.resources.projects.project(fakeProjectId).environments().create({});
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
            .project(projectId)
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
            .project(projectId)
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
            .project(projectId)
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
            .project(projectId)
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
            .project(projectId)
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
          await researcherSession.resources.projects.project(projectId).environments().create({}, false);
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
            .project(projectId)
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
            .project(projectId)
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
