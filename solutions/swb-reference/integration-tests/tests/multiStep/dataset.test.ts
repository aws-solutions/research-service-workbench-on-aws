/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { CreateDataSetRequestParser } from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
import { DataSetPermission } from '@aws/swb-app/lib/dataSets/dataSetPermissionParser';
import { getProjectAdminRole, getResearcherRole } from '../../../src/utils/roleUtils';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import { ENVIRONMENT_START_MAX_WAITING_SECONDS } from '../../support/utils/constants';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import { dsUuidRegExp } from '../../support/utils/regExpressions';
import Settings from '../../support/utils/settings';
import { poll } from '../../support/utils/utilities';

describe('multiStep dataset integration test', () => {
  const setup: Setup = new Setup();
  const settings: Settings = setup.getSettings();
  let adminSession: ClientSession;
  let dataSetName: string;
  let projectId: string;
  let costCenterId: string;

  beforeEach(async () => {
    adminSession = await setup.getDefaultAdminSession();

    const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
    dataSetName = randomTextGenerator.getFakeText('integration-test-dataSet');

    const { data: costCenter } = await adminSession.resources.costCenters.create({
      name: `${dataSetName} cost center`,
      accountId: setup.getSettings().get('defaultHostingAccountId'),
      description: 'a test object'
    });
    costCenterId = costCenter.id;

    const { data: createdProject } = await adminSession.resources.projects.create({
      name: `${dataSetName} project`,
      description: 'test description',
      costCenterId
    });

    projectId = createdProject.id;
  });

  afterEach(async () => {
    await setup.cleanup();
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
      owner: getProjectAdminRole(projectId),
      ownerType: 'GROUP',
      type: 'internal',
      permissions: [
        {
          identity: getResearcherRole(projectId),
          identityType: 'GROUP',
          accessLevel: 'read-write'
        }
      ]
    });

    console.log('CREATE');
    const { data: dataSet } = await adminSession.resources.datasets.create(dataSetBody, false);
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
      projectId,
      description: 'Temporary DataSet for integration test'
    };
    const { data: env } = await adminSession.resources.environments.create(envBody);

    // Verify environment has access point for dataset
    const { data: envDetails } = await adminSession.resources.environments
      .environment(env.id, projectId)
      .get();
    const awsRegion = settings.get('awsRegion');
    const mainAccountId = settings.get('mainAccountId');
    const accessPointName = `${dataSet.id.slice(0, 13)}-mounted-on-${env.id.slice(0, 12)}`;
    expect(envDetails).toMatchObject({
      ENDPOINTS: expect.arrayContaining([
        expect.objectContaining({
          endPointUrl: `s3://arn:aws:s3:${awsRegion}:${mainAccountId}:accesspoint/${accessPointName}`,
          storageArn: `arn:aws:s3:::${settings.get('DataSetsBucketName')}`,
          dataSetId: dataSet.id,
          path: datasetName
        })
      ]),
      DATASETS: expect.arrayContaining([
        expect.objectContaining({
          id: dataSet.id,
          name: datasetName
        })
      ])
    });

    console.log('GET');
    // Verify dataset has env access point listed in its external endpoints
    const { data: dataSetDetails } = await adminSession.resources.datasets.dataset(dataSet.id).get();
    // Dataset was created just for this test case, so we expect only one endpoint
    expect(dataSetDetails).toMatchObject({
      ...dataSetBody,
      externalEndpoints: [envDetails.ENDPOINTS[0].sk.split('ENDPOINT#')[1]]
    });

    console.log('ASSOCIATE WITH PROJECT');
    // Verify the dataset can be associated with a project
    const { data: unassociatedProject } = await adminSession.resources.projects.create({
      name: `${dataSetName} unassociated project`,
      description: 'test description',
      costCenterId
    });
    await adminSession.resources.datasets
      .dataset(dataSet.id)
      .associateWithProject(unassociatedProject.id, 'read-only');

    console.log('CHECK PROJECT PERMISSIONS FOR DATASET');
    const { data: responseData } = await adminSession.resources.datasets
      .dataset(dataSet.id)
      .listAccessPermissions();
    const sortedActual: DataSetPermission[] = responseData.data.permissions.sort(
      (p1: DataSetPermission, p2: DataSetPermission) => p1.accessLevel.localeCompare(p2.accessLevel)
    );
    const expected: DataSetPermission[] = [
      {
        accessLevel: 'read-only',
        identity: `${unassociatedProject.id}#ProjectAdmin`,
        identityType: 'GROUP'
      },
      {
        accessLevel: 'read-write',
        identity: `${projectId}#Researcher`,
        identityType: 'GROUP'
      }
    ];

    expect(sortedActual).toEqual(expected);

    console.log('DISASSOCIATE FROM PROJECT');
    await adminSession.resources.datasets.dataset(dataSet.id).disassociateFromProject(unassociatedProject.id);

    console.log('TERMINATE ENVIRONMENT & REMOVE DATASET');
    await poll(
      async () => {
        const { data: envData } = await adminSession.resources.environments.environment(env.id).get();
        console.log(`env status: ${envData.status}`);
        return envData;
      },
      (data) => data?.status === 'COMPLETED' || data?.status === 'FAILED',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    );
    await adminSession.resources.environments.environment(env.id, projectId).stop();
    await poll(
      async () => {
        const { data: envData } = await adminSession.resources.environments.environment(env.id).get();
        console.log(`env status: ${envData.status}`);
        return envData;
      },
      (data) => data?.status === 'STOPPED' || data?.status === 'FAILED',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    );
    await adminSession.resources.environments.environment(env.id, projectId).terminate();
    await poll(
      async () => {
        const { data: envData } = await adminSession.resources.environments.environment(env.id).get();
        console.log(`env status: ${envData.status}`);
        return envData;
      },
      (data) => data?.status === 'TERMINATED' || data?.status === 'FAILED',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    );
    await adminSession.resources.datasets.dataset(dataSet.id).deleteFromProject(projectId);
  });
});
