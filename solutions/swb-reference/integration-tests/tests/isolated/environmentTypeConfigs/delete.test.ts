/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('delete environment type configs', () => {
  const paabHelper: PaabHelper = new PaabHelper(1);
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
    const paabResources = await paabHelper.createResources(__filename);
    paSession = paabResources.pa1Session;
    researcherSession = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('Project Admin unauthorized to delete ETC', async () => {
    try {
      await paSession.resources.environmentTypes
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .delete();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });
  test('Researcher unauthorized to delete ETC', async () => {
    try {
      await researcherSession.resources.environmentTypes
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .delete();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'User is not authorized'
        })
      );
    }
  });

  test('Unauthenticated user unauthorized to delete ETC', async () => {
    try {
      await anonymousSession.resources.environmentTypes
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .delete();
    } catch (e) {
      checkHttpError(e, new HttpError(403, {}));
    }
  });
});
