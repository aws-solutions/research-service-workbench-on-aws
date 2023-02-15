/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import RandomTextGenerator from '../../../support/utils/randomTextGenerator';
import { checkHttpError } from '../../../support/utils/utilities';

describe('Get Key Pair negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let project: { id: string };
  const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));

  beforeEach(async () => {
    adminSession = await setup.getDefaultAdminSession(); //TODO: change to getPA1Session()
    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: randomTextGenerator.getFakeText('fakeCostCenterName'),
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });

    const { data } = await adminSession.resources.projects.create({
      name: randomTextGenerator.getFakeText('fakeCostCenterName'),
      description: 'Project for list users for project tests',
      costCenterId: costCenter.id
    });

    project = data;
  });

  beforeEach(async () => {
    expect.hasAssertions();
  });

  afterEach(async () => {
    await setup.cleanup();
  });

  describe('with User that is not authorized', () => {
    let pa2UserId: string;
    beforeEach(() => {
      pa2UserId = '00000000-0000-0000-0000-000000000000';
    });
    test.skip('it throws 403 error', async () => {
      try {
        //TODO:
        // get auth :git await adminSession.resources.projects.project(project.id).get()
      } catch (e) {
        // console.error(e)
        checkHttpError(
          e,
          new HttpError(403, {
            statusCode: 403,
            error: 'User is not authorized', //User does not have access
            message: ` ${pa2UserId} for project ${project.id}` //TODO
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
        await adminSession.resources.projects.project(invalidProjectId).sshKeys().get();
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
