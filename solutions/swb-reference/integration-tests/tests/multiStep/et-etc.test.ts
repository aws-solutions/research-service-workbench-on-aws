/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { Project } from '@aws/workbench-core-accounts/lib/models/projects/project';
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { EnvironmentTypeConfig } from '@aws/workbench-core-environments';
import ClientSession from '../../support/clientSession';
import { EnvironmentTypeHelper } from '../../support/complex/environmentTypeHelper';
import Setup from '../../support/setup';
import { DEFLAKE_DELAY_IN_MILLISECONDS } from '../../support/utils/constants';
import HttpError from '../../support/utils/HttpError';
import { envTypeConfigRegExp } from '../../support/utils/regExpressions';
import { checkHttpError, sleep } from '../../support/utils/utilities';

describe('multiStep environment type and environment type config test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const projectId = setup.getSettings().get('projectId');
  const envTypeHandler = new EnvironmentTypeHelper();
  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('create Environment Type', async () => {
    //Create Environment A
    console.log('Creating Environment Type');
    const envType = await envTypeHandler.createEnvironmentType('prod-1234567890123', 'pa-1234567890123');
    const expectedId = `${resourceTypeToKey.envType.toLowerCase()}-prod-1234567890123,pa-1234567890123`;
    expect(envType).toMatchObject({
      id: expectedId,
      status: 'NOT_APPROVED'
    });
    //Throws when creating ETC with non Approved ET
    console.log('Throw when creating Environment Type Config with non approved Environment Type');
    try {
      await adminSession.resources.environmentTypes
        .environmentType(envType.id)
        .configurations()
        .create({}, true);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          statusCode: 400,
          error: 'Bad Request',
          message: `Could not create environment type config because environment type ${envType.id} is not approved`
        })
      );
    }
    //Approve Environment Type
    console.log('Approve Environment Type');
    await adminSession.resources.environmentTypes.environmentType(envType.id).update(
      {
        status: 'APPROVED'
      },
      true
    );
    const { data: approvedEnvType } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .get();
    expect(approvedEnvType).toMatchObject({
      status: 'APPROVED'
    });

    //Update Name for Environment Type
    console.log('Update Environment Type Name');
    await adminSession.resources.environmentTypes.environmentType(envType.id).update(
      {
        name: 'updated name'
      },
      true
    );
    const { data: updatedNameEnvType } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .get();
    expect(updatedNameEnvType).toMatchObject({
      name: 'updated name'
    });

    //Update description for Environment Type
    console.log('Update Environment Type Description');
    await adminSession.resources.environmentTypes.environmentType(envType.id).update(
      {
        description: 'updated description'
      },
      true
    );
    const { data: updatedDescEnvType } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .get();
    expect(updatedDescEnvType).toMatchObject({
      description: 'updated description'
    });

    //Create Environment Type Config
    console.log('Creating Environment Type Config');
    const { data: envTypeConfig } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .configurations()
      .create({}, true);
    expect(envTypeConfig).toMatchObject({
      id: expect.stringMatching(envTypeConfigRegExp)
    });

    //Update Environment Type Config
    console.log('Update Environment Type Config');
    await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .configurations()
      .environmentTypeConfig(envTypeConfig.id)
      .update(
        {
          description: 'new Description',
          estimatedCost: 'new Estimated Cost'
        },
        true
      );
    const { data: updatedEnvTypeConfig } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .configurations()
      .environmentTypeConfig(envTypeConfig.id)
      .get();
    expect(updatedEnvTypeConfig).toMatchObject({
      description: 'new Description',
      estimatedCost: 'new Estimated Cost'
    });

    //Associate project to created environment type config
    console.log('Associate Project with Environment Type Config');
    await expect(
      adminSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envType.id)
        .configurations()
        .environmentTypeConfig(envTypeConfig.id)
        .associate()
    ).resolves.not.toThrow();

    //Retrieve etc association from project
    console.log('Retrieve etc association from project as list');
    const { data: response } = await adminSession.resources.projects
      .project(projectId)
      .environmentTypes()
      .environmentType(envType.id)
      .configurations()
      .get({});
    expect(
      response.data.filter((projETC: EnvironmentTypeConfig) => projETC.id === envTypeConfig.id).length
    ).toBeTruthy();

    console.log('Retrieve single etc association from project');
    const { data: singleResponse } = await adminSession.resources.projects
      .project(projectId)
      .environmentTypes()
      .environmentType(envType.id)
      .configurations()
      .environmentTypeConfig(envTypeConfig.id)
      .get();
    expect(singleResponse.id === envTypeConfig.id).toBeTruthy();

    console.log('Retrieve project association from etc as list');
    const { data: projectsResponse } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .configurations()
      .environmentTypeConfig(envTypeConfig.id)
      .projects()
      .get();
    expect(projectsResponse.data.filter((projETC: Project) => projETC.id === projectId).length).toBeTruthy();

    //Throw when Delete Environment Type Config with active associations
    console.log('Throw when Deleting Environment Type Config with active associations');
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //avoid throttle
    try {
      await adminSession.resources.environmentTypes
        .environmentType(envType.id)
        .configurations()
        .environmentTypeConfig(envTypeConfig.id)
        .delete();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(409, {
          statusCode: 409,
          error: 'Conflict',
          message: `There are projects associated with Workspace configuration. Please dissasociate projects from configuration before deleting.`
        })
      );
    }

    console.log('Disassociate Project with Environment Type Config');
    await expect(
      adminSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envType.id)
        .configurations()
        .environmentTypeConfig(envTypeConfig.id)
        .disassociate()
    ).resolves.not.toThrow();

    //Throw when revoking Environment Type with active etc
    console.log('Throw when revoking Environment Type with active ETC');
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //avoid throttle and give time to ddb to soft delete ETC dependency
    try {
      await adminSession.resources.environmentTypes.environmentType(envType.id).update(
        {
          status: 'NOT_APPROVED'
        },
        true
      );
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(409, {
          statusCode: 409,
          error: 'Conflict',
          message: `Unable to reovke environment type: ${envType.id}, Environment Type has active configurations`
        })
      );
    }

    //Delete Environment Type Config
    console.log('Delete Environment Type Config');
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //avoid throttle
    await expect(
      adminSession.resources.environmentTypes
        .environmentType(envType.id)
        .configurations()
        .environmentTypeConfig(envTypeConfig.id)
        .delete()
    ).resolves;

    //Revoke Environment Type
    console.log('Revoke Environment Type');
    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //avoid throttle and give time to ddb to soft delete ETC dependency
    await adminSession.resources.environmentTypes.environmentType(envType.id).update(
      {
        status: 'NOT_APPROVED'
      },
      true
    );
    const { data: revokedEnvType } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .get();
    expect(revokedEnvType).toMatchObject({
      status: 'NOT_APPROVED'
    });

    //Delete Environment Type
    console.log('Delete Environment Type');
    await expect(envTypeHandler.deleteEnvironmentType(envType.id)).resolves;
  });
});
