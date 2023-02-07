/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

interface CreateRequest {
  name?: string;
  description?: string;
  costCenterId?: string;
}

describe('Create Project negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let costCenterId: string;
  let existingProjectName: string;
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));
  let createRequest: CreateRequest;

  beforeEach(async () => {
    expect.hasAssertions();

    adminSession = await setup.getDefaultAdminSession();

    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: 'project integration test cost center',
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test costcenter'
    });
    costCenterId = costCenter.id;

    existingProjectName = randomTextGenerator.getFakeText('test-project-name');
    await adminSession.resources.projects.create({
      name: existingProjectName,
      description: 'Project for TOP SECRET dragon research',
      costCenterId
    });

    createRequest = {
      name: 'valid name',
      description: 'valid description',
      costCenterId
    };
  });

  afterEach(async () => {
    await setup.cleanup();
  });

  describe('with a name', () => {
    describe('that belongs to an existing project', () => {
      beforeEach(async () => {
        createRequest.name = existingProjectName;
      });

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.projects.create(createRequest);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              statusCode: 400,
              error: 'Bad Request',
              message: `Project name "${existingProjectName}" is in use by a non deleted project. Please use another name.`
            })
          );
        }
      });
    });

    describe('that is missing', () => {
      beforeEach(async () => {
        delete createRequest.name;
      });

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.projects.create(createRequest);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              statusCode: 400,
              error: 'Bad Request',
              message: 'name: Required'
            })
          );
        }
      });
    });
  });

  describe('with a description', () => {
    describe('that is missing', () => {
      beforeEach(async () => {
        delete createRequest.description;
      });

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.projects.create(createRequest);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              statusCode: 400,
              error: 'Bad Request',
              message: 'description: Required'
            })
          );
        }
      });
    });
  });

  describe('with a cost center', () => {
    describe('that does not exist', () => {
      beforeEach(async () => {
        createRequest.costCenterId = 'cc-invalid-cost-center';
      });

      test('it throws 404 error', async () => {
        try {
          await adminSession.resources.projects.create(createRequest);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(404, {
              statusCode: 404,
              error: 'Not Found',
              message: `Could not find cost center cc-invalid-cost-center`
            })
          );
        }
      });
    });

    describe('that is missing', () => {
      beforeEach(async () => {
        delete createRequest.costCenterId;
      });

      test('it throws 400 error', async () => {
        try {
          await adminSession.resources.projects.create(createRequest);
        } catch (e) {
          checkHttpError(
            e,
            new HttpError(400, {
              statusCode: 400,
              error: 'Bad Request',
              message: 'costCenterId: Required'
            })
          );
        }
      });
    });
  });
});
