/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('get environment type configs', () => {
  const setup: Setup = Setup.getSetup();
  const envTypeId = setup.getSettings().get('envTypeId');
  const envTypeConfigId = setup.getSettings().get('envTypeConfigId');
  const paabHelper: PaabHelper = new PaabHelper(0);
  let paSession: ClientSession;
  let researcherSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
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
});
