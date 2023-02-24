/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('update environment type configs', () => {
  const setup: Setup = new Setup();
  const envTypeId = setup.getSettings().get('envTypeId');
  const envTypeConfigId = setup.getSettings().get('envTypeConfigId');
  const paabHelper: PaabHelper = new PaabHelper();
  let itAdminSession: ClientSession;
  let paSession: ClientSession;
  let researcherSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources();
    itAdminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('ITAdmin tests', () => {
    test('fails when trying to update invalid prop', async () => {
      try {
        await itAdminSession.resources.environmentTypes
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .update(
            {
              invalidProp: 'invalidValue'
            },
            true
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

    test('fails when trying to update invalid environment Type Config', async () => {
      try {
        await itAdminSession.resources.environmentTypes
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig('etc-12345678-1234-1234-1234-123456789012')
          .update(
            {
              description: 'new Description'
            },
            true
          );
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message: `Could not find envType ${envTypeId} with envTypeConfig etc-12345678-1234-1234-1234-123456789012 to update`
          })
        );
      }
    });

    test('fails when trying to update invalid environment Type id format', async () => {
      try {
        await itAdminSession.resources.environmentTypes
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig('wrong-format-id')
          .update(
            {
              description: 'new Description'
            },
            true
          );
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            error: 'Not Found',
            message:
              'Could not find envType et-prod-qlzt22ebv436k,pa-blgdqpkiki2ma with envTypeConfig wrong-format-id to update'
          })
        );
      }
    });
  });

  describe('Project Admin tests', () => {
    test('unauthorized to call UpdateEnvironmentTypeConfig', async () => {
      try {
        await paSession.resources.environmentTypes
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig('etc-12345678-1234-1234-1234-123456789012')
          .update(
            {
              description: 'new Description'
            },
            true
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
    test('unauthorized to call UpdateEnvironmentTypeConfig', async () => {
      try {
        await researcherSession.resources.environmentTypes
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig('etc-12345678-1234-1234-1234-123456789012')
          .update(
            {
              description: 'new Description'
            },
            true
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
});
