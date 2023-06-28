/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('create environment type configs', () => {
  const paabHelper: PaabHelper = new PaabHelper(1);
  const setup: Setup = Setup.getSetup();
  const envTypeId = setup.getSettings().get('envTypeId');
  let itAdminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    itAdminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
    await setup.cleanup();
  });

  describe('ITAdmin tests', () => {
    test('fails when trying to create without name', async () => {
      try {
        await itAdminSession.resources.environmentTypes.environmentType(envTypeId).configurations().create(
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
            error: 'Bad Request',
            message: 'name: Required'
          })
        );
      }
    });
    test('fails when trying to create without description', async () => {
      try {
        await itAdminSession.resources.environmentTypes.environmentType(envTypeId).configurations().create(
          {
            type: 'typeTest',
            name: 'name',
            params: []
          },
          false
        );
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

    test('fails when trying to create without type', async () => {
      try {
        await itAdminSession.resources.environmentTypes.environmentType(envTypeId).configurations().create(
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
            error: 'Bad Request',
            message: 'type: Required'
          })
        );
      }
    });

    test('fails when trying to create without params', async () => {
      try {
        await itAdminSession.resources.environmentTypes.environmentType(envTypeId).configurations().create(
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
            error: 'Bad Request',
            message: 'params: Required'
          })
        );
      }
    });

    test('fails when trying to create with invalid prop', async () => {
      try {
        await itAdminSession.resources.environmentTypes.environmentType(envTypeId).configurations().create(
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
            error: 'Bad Request',
            message: ": Unrecognized key(s) in object: 'invalidProp'"
          })
        );
      }
    });

    test('fails when trying to create with invalid environment Type Id', async () => {
      try {
        await itAdminSession.resources.environmentTypes
          .environmentType('et-prod-0123456789012,pa-0123456789012')
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
            error: 'Bad Request',
            message: `Could not create environment type config because environment type does not exist`
          })
        );
      }
    });

    test('fails when trying to create with invalid environment Type id format', async () => {
      try {
        await itAdminSession.resources.environmentTypes
          .environmentType('wrong-format-env-type-id')
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
            error: 'Bad Request',
            message: `envTypeId: Invalid ID`
          })
        );
      }
    });
  });

  describe('Project Admin tests', () => {
    test('unauthorized to create ETC', async () => {
      try {
        await paSession.resources.environmentTypes.environmentType(envTypeId).configurations().create(
          {
            name: 'this should fail',
            type: 'typeTest',
            description: 'description',
            params: []
          },
          false
        );
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
    test('unauthorized to create ETC', async () => {
      try {
        await researcherSession.resources.environmentTypes.environmentType(envTypeId).configurations().create(
          {
            name: 'this should fail',
            type: 'typeTest',
            description: 'description',
            params: []
          },
          false
        );
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

  test('Unauthenticated user cannot create ETC', async () => {
    try {
      await anonymousSession.resources.environmentTypes.environmentType(envTypeId).configurations().create(
        {
          name: 'this should fail',
          type: 'typeTest',
          description: 'description',
          params: []
        },
        false
      );
    } catch (e) {
      checkHttpError(e, new HttpError(403, {}));
    }
  });
});
