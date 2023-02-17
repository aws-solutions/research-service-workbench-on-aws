/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

describe('environments launch negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  const validLaunchParameters = {
    name: randomTextGenerator.getFakeText('name'),
    description: randomTextGenerator.getFakeText('description'),
    envTypeId: setup.getSettings().get('envTypeId'),
    envTypeConfigId: setup.getSettings().get('envTypeConfigId'),
    projectId: setup.getSettings().get('projectId'),
    datasetIds: [],
    envType: setup.getSettings().get('envType')
  };

  describe('missing parameters', () => {
    test('name', async () => {
      try {
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invalidParam: any = { ...validLaunchParameters };
        delete invalidParam.name;
        await adminSession.resources.environments.create(invalidParam, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            error: 'Bad Request',
            message: "requires property 'name'"
          })
        );
      }
    });
  });
  test('envTypeId', async () => {
    try {
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidParam: any = { ...validLaunchParameters };
      delete invalidParam.envTypeId;
      await adminSession.resources.environments.create(invalidParam, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: "requires property 'envTypeId'"
        })
      );
    }
  });
  test('all parameters', async () => {
    try {
      await adminSession.resources.environments.create({}, false);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message:
            "requires property 'name'. requires property 'description'. requires property 'envTypeId'. requires property 'envTypeConfigId'. requires property 'envType'. requires property 'datasetIds'"
        })
      );
    }
  });

  test('404 error when project does not exist', async () => {
    const fakeProjectId: string = 'proj-12345678-1234-1234-1234-123456789012';
    try {
      await adminSession.resources.environments.create({ projectId: fakeProjectId });
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
