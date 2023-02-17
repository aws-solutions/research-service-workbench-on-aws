/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { PaabHelper, paabResources } from '../../../support/complex/paabHelper';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Get Key Pair negative tests', () => {
  const paabHelper = new PaabHelper();
  let paabResources: paabResources;

  beforeEach(async () => {
    paabResources = await paabHelper.createResources();
  });

  beforeEach(async () => {
    expect.hasAssertions();
  });

  afterEach(async () => {
    await paabHelper.cleanup();
  });

  describe('with User that is not authorized', () => {
    beforeEach(() => {
      //const pa2UserId = pa2Session.getUserId();
    });
    test.skip('it throws 403 error', async () => {
      try {
        const response = await paabResources.pa1Session.resources.projects
          .project(paabResources.project2.id)
          .sshKeys()
          .get();
        console.log('response', response);
      } catch (e) {
        //console.error('actualError', e)
        checkHttpError(
          e,
          new HttpError(403, {
            error: 'User is not authorized' //User does not have access
          })
        );
      }
    });
  });

  describe('with Project that does not exist', () => {
    let invalidProjectId: string;

    beforeEach(() => {
      invalidProjectId = 'proj-00000000-0000-0000-0000-000000000000';
    });
    test('it throws 404 error', async () => {
      try {
        await paabResources.adminSession.resources.projects.project(invalidProjectId).sshKeys().get();
      } catch (e) {
        checkHttpError(
          e,
          new HttpError(404, {
            statusCode: 404,
            error: 'Not Found',
            message: `Could not find project ${invalidProjectId}`
          })
        );
      }
    });
  });
});
