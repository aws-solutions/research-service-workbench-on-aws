/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

describe('datasets create negative tests', () => {
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
    datasetName: randomTextGenerator.getFakeText('fakeName'),
    path: randomTextGenerator.getFakeText('fakePath'),
    region: randomTextGenerator.getFakeText('fakeRegion')
  };

  describe('missing parameters', () => {
    test('datasetName', async () => {
      try {
        const invalidParam: { [id: string]: string } = { ...validLaunchParameters };
        delete invalidParam.datasetName;
        await adminSession.resources.datasets.create(invalidParam, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'Bad Request',
            message: "requires property 'datasetName'"
          })
        );
      }
    });

    test('path', async () => {
      try {
        const invalidParam: { [id: string]: string } = { ...validLaunchParameters };
        delete invalidParam.path;
        await adminSession.resources.datasets.create(invalidParam, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'Bad Request',
            message: "requires property 'path'"
          })
        );
      }
    });

    test('region', async () => {
      try {
        const invalidParam: { [id: string]: string } = { ...validLaunchParameters };
        delete invalidParam.region;
        await adminSession.resources.datasets.create(invalidParam, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'Bad Request',
            message: "requires property 'region'"
          })
        );
      }
    });

    test('all parameters', async () => {
      try {
        await adminSession.resources.datasets.create({}, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'Bad Request',
            message: "requires property 'datasetName'. requires property 'path'. requires property 'region'"
          })
        );
      }
    });
  });
});
