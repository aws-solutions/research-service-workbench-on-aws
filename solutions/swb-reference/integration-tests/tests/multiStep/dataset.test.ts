/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { CreateDataSetRequestParser } from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
import { DataSetPermission } from '@aws/swb-app/lib/dataSets/dataSetPermissionParser';
import ClientSession from '../../support/clientSession';
import { PaabHelper } from '../../support/complex/paabHelper';
import Setup from '../../support/setup';
import {
  ENVIRONMENT_START_MAX_WAITING_SECONDS,
  ENVIRONMENT_STOP_MAX_WAITING_SECONDS,
  ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
} from '../../support/utils/constants';
import HttpError from '../../support/utils/HttpError';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import { dsUuidRegExp } from '../../support/utils/regExpressions';
import Settings from '../../support/utils/settings';
import { checkHttpError, poll } from '../../support/utils/utilities';

describe('multiStep dataset integration test', () => {
  const paabHelper: PaabHelper = new PaabHelper(2);
  const setup: Setup = Setup.getSetup();
  const settings: Settings = setup.getSettings();

  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let project1Id: string;
  let project2Id: string;

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources(__filename);
    adminSession = paabResources.adminSession;
    project1Id = paabResources.project1Id;
    pa1Session = paabResources.pa1Session;
    project2Id = paabResources.project2Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  test('Environment provisioning with DataSet', async () => {
    const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
    const datasetName = randomTextGenerator.getFakeText('env-DS-test');

    // Create dataset
    const dataSetBody = CreateDataSetRequestParser.parse({
      storageName: settings.get('DataSetsBucketName'),
      awsAccountId: settings.get('mainAccountId'),
      path: datasetName, // using same name to help potential troubleshooting
      name: datasetName,
      region: settings.get('awsRegion'),
      type: 'internal'
    });

    console.log('CREATE');
    const { data: dataSet } = await pa1Session.resources.projects
      .project(project1Id)
      .dataSets()
      .create(dataSetBody, false);
    expect(dataSet).toMatchObject({
      id: expect.stringMatching(dsUuidRegExp)
    });

    console.log('PROVISION ENVIRONMENT WITH DATASET');
    // Provision environment with dataset
    const envBody = {
      envTypeId: settings.get('envTypeId'),
      envTypeConfigId: settings.get('envTypeConfigId'),
      envType: settings.get('envType'),
      datasetIds: [dataSet.id],
      name: randomTextGenerator.getFakeText('dataset-name'),
      description: 'Temporary DataSet for integration test'
    };
    const { data: env } = await pa1Session.resources.projects
      .project(project1Id)
      .environments()
      .create(envBody);

    // Verify environment has access point for dataset
    const { data: envDetails } = await pa1Session.resources.projects
      .project(project1Id)
      .environments()
      .environment(env.id)
      .get();
    expect(envDetails).toMatchObject({
      ENDPOINTS: expect.arrayContaining([
        expect.objectContaining({
          dataSetId: dataSet.id
        })
      ]),
      DATASETS: expect.arrayContaining([
        expect.objectContaining({
          id: dataSet.id
        })
      ])
    });

    console.log('GET');
    // Verify dataset has env access point listed in its external endpoints
    const { data: dataSetDetails } = await pa1Session.resources.projects
      .project(project1Id)
      .dataSets()
      .dataset(dataSet.id)
      .get();
    // Dataset was created just for this test case, so we expect only one endpoint
    expect(dataSetDetails).toMatchObject({
      ...dataSetBody
    });

    console.log('ASSOCIATE WITH PROJECT');
    await pa1Session.resources.projects
      .project(project1Id)
      .dataSets()
      .dataset(dataSet.id)
      .associateWithProject(project2Id, 'read-only');

    console.log('ENSURE DUPLICATE ASSOCIATION WITH PROJECT THROWS');
    try {
      await pa1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .dataset(dataSet.id)
        .associateWithProject(project2Id, 'read-only');
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(409, {
          error: 'Conflict',
          message: `Project is already associated with Dataset`
        })
      );
    }

    console.log('ASSOCIATE WITH OWNING PROJECT THROWS');
    try {
      await pa1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .dataset(dataSet.id)
        .associateWithProject(project1Id, 'read-only');
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(409, {
          error: 'Conflict',
          message: `Project already owns this dataset`
        })
      );
    }

    console.log('DELETING A DATASET STILL ASSOCIATED WITH A PROJECT FAILS');
    try {
      await pa1Session.resources.projects.project(project1Id).dataSets().dataset(dataSet.id!).delete();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(409, {
          error: 'Conflict',
          message: `DataSet cannot be removed because it is still associated with roles in the provided project(s)`
        })
      );
    }

    console.log('DISASSOCIATING WITH OWNING PROJECT THROWS');
    try {
      await pa1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .dataset(dataSet.id)
        .disassociateFromProject(project1Id);
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(409, {
          error: 'Conflict',
          message: `Requested project cannot remove access from dataset for the ProjectAdmin because it owns that dataset.`
        })
      );
    }

    console.log('CHECK PROJECT PERMISSIONS FOR DATASET');
    const { data: responseData } = await pa1Session.resources.projects
      .project(project1Id)
      .dataSets()
      .dataset(dataSet.id)
      .listAccessPermissions();
    const sortedActual: DataSetPermission[] = responseData.data.permissions.sort(
      (p1: DataSetPermission, p2: DataSetPermission) => p1.accessLevel.localeCompare(p2.accessLevel)
    );
    const expected: DataSetPermission[] = [
      {
        accessLevel: 'read-only',
        identity: `${project2Id}#ProjectAdmin`,
        identityType: 'GROUP'
      },
      {
        accessLevel: 'read-only',
        identity: `${project2Id}#Researcher`,
        identityType: 'GROUP'
      },
      {
        accessLevel: 'read-write',
        identity: `${project1Id}#ProjectAdmin`,
        identityType: 'GROUP'
      },
      {
        accessLevel: 'read-write',
        identity: `${project1Id}#Researcher`,
        identityType: 'GROUP'
      }
    ];

    expect(sortedActual).toEqual(expected);

    console.log('DISASSOCIATE FROM PROJECT');
    await pa1Session.resources.projects
      .project(project1Id)
      .dataSets()
      .dataset(dataSet.id)
      .disassociateFromProject(project2Id);

    console.log('DELETE DATASET BEFORE ENDPOINT IS DELETED FAILS');
    try {
      await pa1Session.resources.projects.project(project1Id).dataSets().dataset(dataSet.id!).delete();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(409, {
          error: 'Conflict',
          message: `External endpoints found on Dataset must be removed before DataSet can be removed.`
        })
      );
    }

    console.log('TERMINATE ENVIRONMENT & REMOVE DATASET');
    await poll(
      async () => {
        const { data: envData } = await pa1Session.resources.projects
          .project(project1Id)
          .environments()
          .environment(env.id)
          .get();
        console.log(`env status: ${envData.status}`);
        return envData;
      },
      (data) => data?.status === 'COMPLETED' || data?.status === 'FAILED',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    );
    try {
      await pa1Session.resources.projects.project(project1Id).environments().environment(env.id).stop();
      await poll(
        async () => {
          const { data: envData } = await pa1Session.resources.projects
            .project(project1Id)
            .environments()
            .environment(env.id)
            .get();
          console.log(`env status: ${envData.status}`);
          return envData;
        },
        (data) => data?.status === 'STOPPED' || data?.status === 'FAILED',
        ENVIRONMENT_STOP_MAX_WAITING_SECONDS
      );
    } catch (e) {
      console.error(JSON.stringify(e));
    }
    await pa1Session.resources.projects.project(project1Id).environments().environment(env.id).terminate();
    await poll(
      async () => {
        const { data: envData } = await pa1Session.resources.projects
          .project(project1Id)
          .environments()
          .environment(env.id)
          .get();
        console.log(`env status: ${envData.status}`);
        return envData;
      },
      (data) => data?.status === 'TERMINATED' || data?.status === 'FAILED',
      ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
    );

    console.log('CREATE ENVIRONMENT WITH UNAUTHORIZED DATASET THROWS ERROR');
    await adminSession.resources.projects
      .project(project2Id)
      .assignUserToProject(pa1Session.getUserId()!, { role: 'ProjectAdmin' });
    try {
      await pa1Session.resources.projects.project(project2Id).environments().create(envBody);
    } catch (e) {
      await adminSession.resources.projects
        .project(project2Id)
        .removeUserFromProject(pa1Session.getUserId()!);
      checkHttpError(
        e,
        new HttpError(403, {
          error: 'Forbidden',
          message: `Project does not have access to the provided dataset(s)`
        })
      );
    }
    await adminSession.resources.projects.project(project2Id).removeUserFromProject(pa1Session.getUserId()!);
  });
});
