/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('get environment type configs', () => {
  const setup: Setup = Setup.getSetup();
  const envTypeId = setup.getSettings().get('envTypeId');
  const envTypeConfigId = setup.getSettings().get('envTypeConfigId');
  let paSession: ClientSession;
  let researcherSession: ClientSession;
  let anonymousSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    paSession = await setup.getSessionForUserType('projectAdmin1');
    researcherSession = await setup.getSessionForUserType('researcher1');
    anonymousSession = await setup.createAnonymousSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('Project Admin tests', () => {
    test('unauthorized to call GetEnvironmentTypeConfig', async () => {
      try {
        await paSession.resources.environmentTypes
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .get();
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
    test('unauthorized to call GetEnvironmentTypeConfig', async () => {
      try {
        await researcherSession.resources.environmentTypes
          .environmentType(envTypeId)
          .configurations()
          .environmentTypeConfig(envTypeConfigId)
          .get();
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

  test('Unauthorized user cannot call GetEnvironmentTypeConfig', async () => {
    try {
      await anonymousSession.resources.environmentTypes
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .get();
    } catch (e) {
      checkHttpError(e, new HttpError(401, {}));
    }
  });
});
