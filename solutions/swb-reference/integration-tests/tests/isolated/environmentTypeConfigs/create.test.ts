/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('create environment type configs', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const envTypeId = setup.getSettings().get('envTypeId');

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('fails when trying to create without name', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType(envTypeId).configurations().create(
        {
          type: 'typeTest',
          description: 'description',
          params: []
        },
        false
      );
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

  test('fails when trying to create without type', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType(envTypeId).configurations().create(
        {
          name: 'name',
          description: 'description',
          params: []
        },
        false
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: 'type: Required'
        })
      );
    }
  });

  test('fails when trying to create without params', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType(envTypeId).configurations().create(
        {
          name: 'name',
          description: 'description',
          type: 'type'
        },
        false
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: 'params: Required'
        })
      );
    }
  });

  test('fails when trying to create with invalid prop', async () => {
    try {
      await adminSession.resources.environmentTypes.environmentType(envTypeId).configurations().create(
        {
          type: 'typeTest',
          description: 'description',
          name: 'name',
          invalidProp: 'invalidValue',
          params: []
        },
        false
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: ": Unrecognized key(s) in object: 'invalidProp'"
        })
      );
    }
  });

  test('fails when trying to create with invalid environment Type Id', async () => {
    try {
      await adminSession.resources.environmentTypes
        .environmentType('et-prod-1234567890124,pa-1234567890124')
        .configurations()
        .create(
          {
            type: 'typeTest',
            description: 'description',
            name: 'name',
            params: []
          },
          false
        );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: `Could not create environment type config because environment type et-prod-1234567890124,pa-1234567890124 does not exist`
        })
      );
    }
  });

  test('fails when trying to create with invalid environment Type id format', async () => {
    try {
      await adminSession.resources.environmentTypes
        .environmentType('wrong-foramt-env-type-id')
        .configurations()
        .create(
          {
            type: 'typeTest',
            description: 'description',
            name: 'name',
            params: []
          },
          false
        );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          statusCode: 403,
          error: 'User is not authorized'
        })
      );
    }
  });
});
