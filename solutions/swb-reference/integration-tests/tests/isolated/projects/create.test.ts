/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

interface CreateRequest {
  name?: string;
  description?: string;
  costCenterId?: string;
}

describe('Create Project negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const costCenterId = setup.getSettings().get('costCenterId');

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('with invalid name values', () => {
    const createRequest: CreateRequest = {
      description: 'new project who dis',
      costCenterId
    };

    describe('with name that belongs to an existing project', () => {
      const existingProjectName = setup.getSettings().get('projectName');

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

    describe('with missing name', () => {
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

  describe('with invalid description values', () => {
    const createRequest: CreateRequest = {
      name: 'valid input',
      costCenterId
    };

    describe('with missing description', () => {
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

  describe('with invalid costCenterId values', () => {
    const createRequest: CreateRequest = {
      name: 'valid name',
      description: 'valid description',
      costCenterId
    };

    describe('with cost center that does not exist', () => {
      const invalidCostCenterId = 'cc-invalid-cost-center';

      beforeEach(async () => {
        createRequest.costCenterId = invalidCostCenterId;
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

    describe('with missing cost center', () => {
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
