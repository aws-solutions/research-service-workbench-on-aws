/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import { ENVIRONMENT_START_MAX_WAITING_SECONDS } from '../../../support/utils/constants';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError, poll } from '../../../support/utils/utilities';

describe('Cannot send SSH Key', () => {
  const paabHelper = new PaabHelper(2);
  const setup: Setup = Setup.getSetup();
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let pa2Session: ClientSession;
  let anonymousSession: ClientSession;
  let project1Id: string;
  let project2Id: string;
  let project2EnvId: string;
  let project1EnvId: string;
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));
  const validLaunchParameters = {
    name: randomTextGenerator.getFakeText('name'),
    description: randomTextGenerator.getFakeText('send ssh key test description'),
    envTypeId: setup.getSettings().get('envTypeId'),
    envTypeConfigId: setup.getSettings().get('envTypeConfigId'),
    datasetIds: [],
    envType: setup.getSettings().get('envType')
  };

  const testBundle = [
    {
      username: 'projectAdmin1',
      session: () => pa1Session,
      projectId: () => project1Id
    },
    {
      username: 'researcher1',
      session: () => rs1Session,
      projectId: () => project1Id
    }
  ];

  beforeAll(async () => {
    ({ adminSession, pa1Session, rs1Session, pa2Session, project1Id, project2Id, anonymousSession } =
      await paabHelper.createResources(__filename));
    const { data: env1 } = await pa1Session.resources.projects
      .project(project1Id)
      .environments()
      .create(validLaunchParameters, false);
    project1EnvId = env1.id;
    const { data: env2 } = await pa2Session.resources.projects
      .project(project2Id)
      .environments()
      .create(validLaunchParameters, false);
    project2EnvId = env2.id;
  });

  beforeEach(async () => {
    expect.hasAssertions();
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe(`when project id does not match env's project`, () => {
    // project is project1 and env is project2 but each user has access to project1
    test.each(testBundle)('it throws 400', async (testCase) => {
      const { username, session: sessionFunc, projectId: projectIdFunc } = testCase;
      const session = sessionFunc();
      const projectId = projectIdFunc();

      console.log(`as ${username}`);

      try {
        await session.resources.projects
          .project(projectId)
          .environments()
          .environment(project2EnvId)
          .sshKeys();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `Requested Project ID does not match environment Project ID`
          })
        );
      }
    });
  });

  describe(`when instance id is not defined`, () => {
    test.each(testBundle)('it throws 400', async (testCase) => {
      const { username, session: sessionFunc, projectId: projectIdFunc } = testCase;
      const session = sessionFunc();
      const projectId = projectIdFunc();

      console.log(`as ${username}`);

      try {
        await session.resources.projects
          .project(projectId)
          .environments()
          .environment(project1EnvId)
          .sshKeys();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `Instance Id is not defined for environment yet. Try again later.`
          })
        );
      }
    });
  });

  describe(`when environment is not COMPLETED`, () => {
    test.each(testBundle)('it throws 400', async (testCase) => {
      const { username, session: sessionFunc, projectId: projectIdFunc } = testCase;
      const session = sessionFunc();
      const projectId = projectIdFunc();

      console.log(`as ${username}`);

      // wait for env to complete
      await poll(
        async () =>
          session.resources.projects.project(projectId).environments().environment(project1EnvId).get(),
        (env) => !['PENDING', 'STOPPING', 'STARTING'].includes(env?.data?.status),
        ENVIRONMENT_START_MAX_WAITING_SECONDS
      );
      // stop env
      await session.resources.projects.project(projectId).environments().environment(project1EnvId).stop();

      try {
        await session.resources.projects
          .project(projectId)
          .environments()
          .environment(project1EnvId)
          .sshKeys();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: `The environment is not available yet. Try again later.`
          })
        );
      }
    });
  });

  test('Unauthenticated user gets error', async () => {
    try {
      await anonymousSession.resources.projects
        .project(project2EnvId)
        .environments()
        .environment(project2EnvId)
        .sshKeys();
    } catch (e) {
      checkHttpError(e, new HttpError(401, {}));
    }
  });

  test('IT Admin user gets error', async () => {
    try {
      await adminSession.resources.projects
        .project(project2EnvId)
        .environments()
        .environment(project2EnvId)
        .sshKeys();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: `User is not authorized`
        })
      );
    }
  });
});
