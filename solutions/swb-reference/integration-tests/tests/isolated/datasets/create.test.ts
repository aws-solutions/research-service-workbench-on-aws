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
    storageName: randomTextGenerator.getFakeText('fakeBucket'),
    path: randomTextGenerator.getFakeText('fakePath'),
    awsAccountId: randomTextGenerator.getFakeText('fakeAccount')
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

    test('storageName', async () => {
      try {
        const invalidParam: { [id: string]: string } = { ...validLaunchParameters };
        delete invalidParam.storageName;
        await adminSession.resources.datasets.create(invalidParam, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'Bad Request',
            message: "requires property 'storageName'"
          })
        );
      }
    });

    test('awsAccountId', async () => {
      try {
        const invalidParam: { [id: string]: string } = { ...validLaunchParameters };
        delete invalidParam.awsAccountId;
        await adminSession.resources.datasets.create(invalidParam, false);
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(400, {
            statusCode: 400,
            error: 'Bad Request',
            message: "requires property 'awsAccountId'"
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
            message:
              "requires property 'datasetName'. requires property 'storageName'. requires property 'path'. requires property 'awsAccountId'"
          })
        );
      }
    });
  });
});
