/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { Project } from '@aws/workbench-core-accounts/lib/models/projects/project';
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { EnvironmentTypeConfig } from '@aws/workbench-core-environments';
import ClientSession from '../../support/clientSession';
import { EnvironmentTypeHelper } from '../../support/complex/environmentTypeHelper';
import { PaabHelper } from '../../support/complex/paabHelper';
import { DEFLAKE_DELAY_IN_MILLISECONDS } from '../../support/utils/constants';
import HttpError from '../../support/utils/HttpError';
import { envTypeConfigRegExp } from '../../support/utils/regExpressions';
import { checkHttpError, sleep } from '../../support/utils/utilities';

describe('multiStep environment type and environment type config test', () => {
  const envTypeHandler = new EnvironmentTypeHelper();
  const paabHelper: PaabHelper = new PaabHelper(1);
  let adminSession: ClientSession;
  let paSession: ClientSession;
  let projectId: string;
  let researcherSession: ClientSession;

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    adminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    projectId = paabResources.project1Id;
    researcherSession = paabResources.rs1Session;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  test('create Environment Type', async () => {
    //Create Environment A
    console.log('Creating Environment Type');
    const uniqueTimeId = Date.now();
    const envType = await envTypeHandler.createEnvironmentType(`prod-${uniqueTimeId}`, `pa-${uniqueTimeId}`);
    const expectedId = `${resourceTypeToKey.envType.toLowerCase()}-prod-${uniqueTimeId},pa-${uniqueTimeId}`;
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
      throw new Error('Creating ETC with non approved Environment Type did not throw an error');
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(400, {
          error: 'Bad Request',
          message: `Could not create environment type config because environment type is not approved`
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

    console.log('Get Environment Type as IT Admin');
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
        name: 'updated_name'
      },
      true
    );
    const { data: updatedNameEnvType } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .get();
    expect(updatedNameEnvType).toMatchObject({
      name: 'updated_name'
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

    console.log('Get Environment Type Config as Admin');
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

    //Test retrieving as ITAdmin
    console.log('Get Environment Type as Admin');
    await adminSession.resources.environmentTypes.environmentType(envType.id).get();

    console.log('List Environment Types as Admin');
    await adminSession.resources.environmentTypes.get();

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

    //Test retrieving as Project Admin
    console.log('Get Environment Type as Proj Admin');
    await paSession.resources.environmentTypes.environmentType(envType.id).get();

    console.log('List Environment Types as Project Admin');
    await paSession.resources.environmentTypes.get();

    console.log('Retrieve etc association from project as list');
    const { data: paResponse } = await paSession.resources.projects
      .project(projectId)
      .environmentTypes()
      .environmentType(envType.id)
      .configurations()
      .get({});
    expect(
      paResponse.data.filter((projETC: EnvironmentTypeConfig) => projETC.id === envTypeConfig.id).length
    ).toBeTruthy();

    console.log('Retrieve single etc association from project');
    const { data: paSingleResponse } = await paSession.resources.projects
      .project(projectId)
      .environmentTypes()
      .environmentType(envType.id)
      .configurations()
      .environmentTypeConfig(envTypeConfig.id)
      .get();
    expect(paSingleResponse.id === envTypeConfig.id).toBeTruthy();

    //Test retrieving as Researcher
    console.log('Get Environment Type as Researcher');
    await researcherSession.resources.environmentTypes.environmentType(envType.id).get();

    console.log('List Environment Types as Researcher');
    await researcherSession.resources.environmentTypes.get();

    console.log('Retrieve etc association from project as list');
    const { data: researcherResponse } = await researcherSession.resources.projects
      .project(projectId)
      .environmentTypes()
      .environmentType(envType.id)
      .configurations()
      .get({});
    expect(
      researcherResponse.data.filter((projETC: EnvironmentTypeConfig) => projETC.id === envTypeConfig.id)
        .length
    ).toBeTruthy();

    console.log('Retrieve single etc association from project');
    const { data: researcherSingleResponse } = await researcherSession.resources.projects
      .project(projectId)
      .environmentTypes()
      .environmentType(envType.id)
      .configurations()
      .environmentTypeConfig(envTypeConfig.id)
      .get();
    expect(researcherSingleResponse.id === envTypeConfig.id).toBeTruthy();

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
          error: 'Conflict',
          message: `Unable to reovke environment type, Environment Type has active configurations`
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
