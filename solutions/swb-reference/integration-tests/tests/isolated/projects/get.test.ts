/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import { PaabHelper } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Get Project negative tests', () => {
  const paabHelper: PaabHelper = new PaabHelper(2);
  let pa1Session: ClientSession;
  let rs1Session: ClientSession;
  let anonymousSession: ClientSession;
  let project2Id: string;

  beforeEach(async () => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    pa1Session = paabResources.pa1Session;
    rs1Session = paabResources.rs1Session;
    anonymousSession = paabResources.anonymousSession;
    project2Id = paabResources.project2Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  describe('when a ProjectAdmin GETs a project they do not belong to', () => {
    test('it returns a 403', async () => {
      try {
        await pa1Session.resources.projects.project(project2Id).get();
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

  describe('when a Researcher GETs a project they do not belong to', () => {
    test('it returns a 403', async () => {
      try {
        await rs1Session.resources.projects.project(project2Id).get();
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

  test('Unauthenticated user gets 401', async () => {
    try {
      await anonymousSession.resources.projects.project(project2Id).get();
    } catch (e) {
      checkHttpError(e, new HttpError(401, {}));
    }
  });
});
