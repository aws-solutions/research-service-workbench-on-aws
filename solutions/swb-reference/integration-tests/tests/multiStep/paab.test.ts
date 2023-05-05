/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { CreateDataSetRequestParser } from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
import { getProjectAdminRole, getResearcherRole } from '../../../src/utils/roleUtils';
import ClientSession from '../../support/clientSession';
import { PaabHelper } from '../../support/complex/paabHelper';
import { ListDatasetsResponse } from '../../support/models/datasets';
import { ListEnvironmentResponse } from '../../support/models/environments';
import { ListETCsResponse } from '../../support/models/environmentTypeConfigs';
import { ListProjectsResponse } from '../../support/models/projects';
import Setup from '../../support/setup';
import {
  ENVIRONMENT_START_MAX_WAITING_SECONDS,
  ENVIRONMENT_STOP_MAX_WAITING_SECONDS,
  ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
} from '../../support/utils/constants';
import HttpError from '../../support/utils/HttpError';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import { envUuidRegExp } from '../../support/utils/regExpressions';
import Settings from '../../support/utils/settings';
import { checkHttpError, poll } from '../../support/utils/utilities';

describe('multiStep environment test', () => {
  const paabHelper: PaabHelper = new PaabHelper();
  const setup: Setup = Setup.getSetup();
  const settings: Settings = setup.getSettings();
  const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
  const etId: string = settings.get('envTypeId');
  const type: string = settings.get('envType');
  const unauthorizedHttpError = new HttpError(403, { error: 'User is not authorized' });
  const defaultSageMakerETCBody = {
    type,
    params: [
      {
        key: 'IamPolicyDocument',
        value: '${iamPolicyDocument}'
      },
      {
        key: 'InstanceType',
        value: 'ml.t3.medium'
      },
      {
        key: 'AutoStopIdleTimeInMinutes',
        value: '0'
      },
      {
        key: 'CIDR',
        value: '0.0.0.0/0'
      }
    ]
  };

  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let pa2Session: ClientSession;
  let project1Id: string;
  let project2Id: string;
  let project3Id: string;
  let project4Id: string;
  let rs1Session: ClientSession;

  beforeAll(async () => {
    ({ adminSession, pa1Session, pa2Session, project1Id, project2Id, project3Id, rs1Session, project4Id } =
      await paabHelper.createResources());
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  test('test project as a boundary against all resources', async () => {
    console.log('Creating Environment Type Configs for Projects...');
    const { data: etc1 } = await adminSession.resources.environmentTypes
      .environmentType(etId)
      .configurations()
      .create(defaultSageMakerETCBody);
    const { data: etc2 } = await adminSession.resources.environmentTypes
      .environmentType(etId)
      .configurations()
      .create(defaultSageMakerETCBody);
    const { data: etc3 } = await adminSession.resources.environmentTypes
      .environmentType(etId)
      .configurations()
      .create(defaultSageMakerETCBody);
    const { data: etc4 } = await adminSession.resources.environmentTypes
      .environmentType(etId)
      .configurations()
      .create(defaultSageMakerETCBody);

    console.log('Associating Environment Type Configs to Projects...');
    await adminSession.resources.projects
      .project(project1Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .environmentTypeConfig(etc1.id)
      .associate();
    await adminSession.resources.projects
      .project(project2Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .environmentTypeConfig(etc2.id)
      .associate();
    await adminSession.resources.projects
      .project(project3Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .environmentTypeConfig(etc3.id)
      .associate();
    await adminSession.resources.projects
      .project(project4Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .environmentTypeConfig(etc4.id)
      .associate();

    console.log('Creating Environment1 for Project1...');
    const env1Body = {
      envTypeId: etId,
      envTypeConfigId: etc1.id,
      envType: type,
      datasetIds: [],
      name: randomTextGenerator.getFakeText('paab-test-env1'),
      description: 'Environment1 for paab.test'
    };
    const { data: env1 } = await pa1Session.resources.projects
      .project(project1Id)
      .environments()
      .create(env1Body, false);

    console.log('Creating Environment2 for Project2...');
    const env2Body = {
      envTypeId: etId,
      envTypeConfigId: etc2.id,
      envType: type,
      datasetIds: [],
      name: randomTextGenerator.getFakeText('paab-test-env2'),
      description: 'Environment2 for paab.test'
    };
    const { data: env2 } = await pa2Session.resources.projects
      .project(project2Id)
      .environments()
      .create(env2Body, false);

    console.log('Creating Environment3 for Project3...');
    const env3Body = {
      envTypeId: etId,
      envTypeConfigId: etc3.id,
      envType: type,
      datasetIds: [],
      name: randomTextGenerator.getFakeText('paab-test-env3'),
      description: 'Environment3 for paab.test'
    };
    const { data: env3 } = await pa1Session.resources.projects
      .project(project3Id)
      .environments()
      .create(env3Body, false);

    console.log('Creating Dataset1 for Project1...');
    const datasetName = randomTextGenerator.getFakeText('paab-test');
    const dataSetBody = CreateDataSetRequestParser.parse({
      storageName: settings.get('DataSetsBucketName'),
      awsAccountId: settings.get('mainAccountId'),
      path: datasetName, // using same name to help potential troubleshooting
      name: datasetName,
      region: settings.get('awsRegion'),
      owner: getProjectAdminRole(project1Id),
      ownerType: 'GROUP',
      type: 'internal',
      permissions: [
        {
          identity: getResearcherRole(project1Id),
          identityType: 'GROUP',
          accessLevel: 'read-write'
        }
      ]
    });
    const { data: ds1 } = await pa1Session.resources.projects
      .project(project1Id)
      .dataSets()
      .create(dataSetBody, false);

    console.log('Test to ensure access is given immediately when a user is added to a project');

    console.log('Verifying PA1 CANNOT see Project4...');
    const { data: pa1Projects }: ListProjectsResponse = await pa1Session.resources.projects.get();
    expect(pa1Projects.data.filter((proj) => proj.id === project2Id).length).toEqual(0);

    // Get Projects
    try {
      await pa1Session.resources.projects.project(project4Id).get();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }

    console.log('Verifying PA1 CANNOT see ETC4');
    try {
      await pa1Session.resources.projects
        .project(project4Id)
        .environmentTypes()
        .environmentType(etId)
        .configurations()
        .environmentTypeConfig(etc4.id)
        .get();
    } catch (e) {
      checkHttpError(e, unauthorizedHttpError);
    }

    console.log('Adding PA1 to Project4 as a Project Admin');
    await adminSession.resources.projects
      .project(project4Id)
      .assignUserToProject(pa1Session.getUserId()!, { role: 'ProjectAdmin' });

    console.log('Verifying PA1 CAN see Project4...');
    const { data: updatedPa1Projects }: ListProjectsResponse = await pa1Session.resources.projects.get();
    expect(updatedPa1Projects.data.filter((proj) => proj.id === project2Id).length).toEqual(1);
    const { data: receivedProject4 } = await pa1Session.resources.projects.project(project4Id).get();

    expect(receivedProject4.id).toStrictEqual(project4Id);

    console.log('Verifying PA1 CAN see ETC4');
    const { data: receivedEtc4 } = await pa1Session.resources.projects
      .project(project4Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .environmentTypeConfig(etc4.id)
      .get();

    expect(receivedEtc4).toStrictEqual(etc4);

    console.log('Test to ensure access is revoked immediately when a user is removed from a project');

    console.log('Removing PA1 from Project4');
    await adminSession.resources.projects.project(project4Id).removeUserFromProject(pa1Session.getUserId()!);

    console.log('Verifying PA1 CANNOT see Project4');
    // Get Projects
    try {
      await pa1Session.resources.projects.project(project4Id).get();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }

    console.log('Verifying PA1 CANNOT see ETC4');
    try {
      await pa1Session.resources.projects
        .project(project4Id)
        .environmentTypes()
        .environmentType(etId)
        .configurations()
        .environmentTypeConfig(etc4.id)
        .get();
    } catch (e) {
      checkHttpError(e, unauthorizedHttpError);
    }

    console.log('Successfully completed immediate allowed and revoked project access');

    console.log('Verifying PA1 CANNOT see Project2...');
    // List Projects
    const { data: listProjects1 }: ListProjectsResponse = await pa1Session.resources.projects.get();
    expect(listProjects1.data.filter((proj) => proj.id === project2Id).length).toEqual(0);

    // Get Projects
    try {
      await pa1Session.resources.projects.project(project2Id).get();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }

    console.log('Verify PA1 CANNOT see ETC2...');
    // Get ETC
    try {
      await pa1Session.resources.projects
        .project(project2Id)
        .environmentTypes()
        .environmentType(etId)
        .configurations()
        .environmentTypeConfig(etc2.id)
        .get();
    } catch (e) {
      checkHttpError(e, unauthorizedHttpError);
    }
    // List ETCs for Project
    const { data: listEtcs1 }: ListETCsResponse = await pa1Session.resources.projects
      .project(project1Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .get();
    expect(listEtcs1.data.filter((etc) => etc.id === etc2.id).length).toEqual(0);

    console.log('Verifying PA1 CANNOT create an Environment in Project2...');
    try {
      await pa1Session.resources.projects.project(project2Id).environments().create();
    } catch (e) {
      checkHttpError(e, unauthorizedHttpError);
    }

    console.log('Verifying PA2 CANNOT see Project1...');
    // List Projects
    const { data: listProjects2 }: ListProjectsResponse = await pa2Session.resources.projects.get();
    expect(listProjects2.data.filter((proj) => proj.id === project1Id).length).toEqual(0);
    // Get Projects
    try {
      await pa2Session.resources.projects.project(project1Id).get();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }

    console.log('Verifying PA2 CANNOT see Project3...');
    // List Projects
    const { data: listProjects3 }: ListProjectsResponse = await pa2Session.resources.projects.get();
    expect(listProjects3.data.filter((proj) => proj.id === project3Id).length).toEqual(0);
    // Get Projects
    try {
      await pa2Session.resources.projects.project(project3Id).get();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }

    console.log('Verifying PA2 CANNOT see Dataset1...');
    // List Datasets for Project
    const { data: pa2Datasets }: ListDatasetsResponse = await pa2Session.resources.projects
      .project(project2Id)
      .dataSets()
      .get();
    expect(pa2Datasets.data.filter((ds) => ds.id === ds1.id).length).toEqual(0);
    // Get Dataset
    try {
      await pa2Session.resources.projects.project(project1Id).dataSets().dataset(ds1.id).get();
    } catch (e) {
      checkHttpError(e, unauthorizedHttpError);
    }

    console.log('Verifying PA2 cannot upload files to Dataset1...');
    const fileName: string = 'file.txt';
    try {
      await pa1Session.resources.projects
        .project(project1Id)
        .dataSets()
        .dataset(ds1.id)
        .getFileUploadUrls(fileName);
    } catch (e) {
      checkHttpError(e, unauthorizedHttpError);
    }

    console.log('Verifying PA2 CANNOT see Environment1');
    // List Environments for Project
    const { data: pa2Environments }: ListEnvironmentResponse = await pa2Session.resources.projects
      .project(project2Id)
      .environments()
      .listProjectEnvironments();
    expect(pa2Environments.data.filter((env) => env.id === env1.id).length).toEqual(0);
    // Get Environment
    try {
      await pa2Session.resources.projects.project(project1Id).environments().environment(env1.id).get();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }

    console.log('Verifying PA2 CANNOT call any Environment APIs against Environment1');
    // Connect
    try {
      await pa2Session.resources.projects.project(project1Id).environments().environment(env1.id).connect();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }
    // Start
    try {
      await pa2Session.resources.projects.project(project1Id).environments().environment(env1.id).start();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }
    // Stop
    try {
      await pa2Session.resources.projects.project(project1Id).environments().environment(env1.id).stop();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }
    // Terminate
    try {
      await pa2Session.resources.projects.project(project1Id).environments().environment(env1.id).terminate();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }

    console.log('Verifying Researcher1 CANNOT see Project2...');
    // List Projects
    const { data: researcherProjects }: ListProjectsResponse = await rs1Session.resources.projects.get();
    expect(researcherProjects.data.filter((proj) => proj.id === project2Id).length).toEqual(0);
    // Get Projects
    try {
      await rs1Session.resources.projects.project(project2Id).get();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }

    console.log('Verifying Researcher1 CAN ONLY see Environment1 on project1 Request');
    // List Environments for Project
    const { data: researcherProj1Environments }: ListEnvironmentResponse = await rs1Session.resources.projects
      .project(project1Id)
      .environments()
      .listProjectEnvironments();
    expect(researcherProj1Environments.data.filter((env) => env.id === env1.id).length).toEqual(1);
    expect(researcherProj1Environments.data.filter((env) => env.id === env3.id).length).toEqual(0);

    console.log('Verifying Researcher1 CANNOT see Environment1 on single get REQUEST using project3');
    await expect(
      rs1Session.resources.projects.project(project3Id).environments().environment(env1.id).get()
    ).rejects.toThrowError(
      new HttpError(404, { error: `Couldnt find environment ${env1.id} with project ${project3Id}` })
    );

    console.log('Verifying Researcher1 CAN ONLY see Environment3 on project3 Request');
    // List Environments for Project
    const { data: researcherProj3Environments }: ListEnvironmentResponse = await rs1Session.resources.projects
      .project(project3Id)
      .environments()
      .listProjectEnvironments();
    expect(researcherProj3Environments.data.filter((env) => env.id === env3.id).length).toEqual(1);
    expect(researcherProj3Environments.data.filter((env) => env.id === env1.id).length).toEqual(0);

    console.log('Verifying Researcher1 CANNOT see Environment2...');
    // List Environments for Project
    const { data: researcherEnvironments }: ListEnvironmentResponse = await rs1Session.resources.projects
      .project(project1Id)
      .environments()
      .listProjectEnvironments();
    expect(researcherEnvironments.data.filter((env) => env.id === env2.id).length).toEqual(0);
    // Get Environment
    try {
      await rs1Session.resources.projects.project(project2Id).environments().environment(env2.id).get();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }

    console.log('Verifying Researcher1 CANNOT call any Environment APIs against Environment2');
    // Connect
    try {
      await rs1Session.resources.projects.project(project2Id).environments().environment(env2.id).connect();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }
    // Start
    try {
      await rs1Session.resources.projects.project(project2Id).environments().environment(env2.id).start();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }
    // Stop
    try {
      await rs1Session.resources.projects.project(project2Id).environments().environment(env2.id).stop();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }
    // Terminate
    try {
      await rs1Session.resources.projects.project(project2Id).environments().environment(env2.id).terminate();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }

    console.log('Verifying Researcher1 CANNOT see ETC2...');
    // Get ETC
    try {
      await rs1Session.resources.projects
        .project(project2Id)
        .environmentTypes()
        .environmentType(etId)
        .configurations()
        .environmentTypeConfig(etc2.id)
        .get();
    } catch (e) {
      checkHttpError(e, unauthorizedHttpError);
    }
    // List ETCs for Project
    const { data: rs1Etcs }: ListETCsResponse = await rs1Session.resources.projects
      .project(project1Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .get();
    expect(rs1Etcs.data.filter((etc) => etc.id === etc2.id).length).toEqual(0);

    console.log('Verifying Researcher1 CANNOT create Environment in Project2...');
    try {
      await rs1Session.resources.projects.project(project2Id).environments().create();
    } catch (e) {
      checkHttpError(e, unauthorizedHttpError);
    }

    console.log('Verifying ITAdmin CAN see both environments...');
    // List Environments
    const { data: allEnvironments }: ListEnvironmentResponse =
      await adminSession.resources.environments.get();
    expect(allEnvironments.data.filter((env) => env.id === env1.id).length).toEqual(1);
    expect(allEnvironments.data.filter((env) => env.id === env2.id).length).toEqual(1);
    // Get Environment
    const { data: adminEnv1 } = await adminSession.resources.projects
      .project(project1Id)
      .environments()
      .environment(env1.id)
      .get();
    expect(adminEnv1.id).toEqual(env1.id);
    const { data: adminEnv2 } = await adminSession.resources.projects
      .project(project2Id)
      .environments()
      .environment(env2.id)
      .get();
    expect(adminEnv2.id).toEqual(env2.id);

    console.log('Verifying ITAdmin CANNOT upload file to Dataset1...');
    try {
      await adminSession.resources.projects
        .project(project1Id)
        .dataSets()
        .dataset(ds1.id)
        .getFileUploadUrls(fileName);
    } catch (e) {
      checkHttpError(e, unauthorizedHttpError);
    }

    console.log('Verifying ITAdmin CANNOT connect to Environment1...');
    try {
      await adminSession.resources.projects.project(project2Id).environments().environment(env2.id).connect();
    } catch (err) {
      checkHttpError(err, unauthorizedHttpError);
    }

    console.log('Verifying Researcher1 CAN call all Environment APIs against Environment1...');
    // Start (expecting this to fail since the state is not STOPPED, but not due to unauthorized access)
    try {
      await rs1Session.resources.projects.project(project1Id).environments().environment(env1.id).start();
    } catch (e) {
      expect(e).not.toEqual(unauthorizedHttpError);
    }
    await _waitForEnvironmentToReachState(
      rs1Session,
      project1Id,
      env1.id,
      'PENDING',
      'COMPLETED',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    );

    console.log('Verifying Researcher1 CANNOT stop Environment1 using project3');
    await expect(
      rs1Session.resources.projects.project(project3Id).environments().environment(env1.id).stop()
    ).rejects.toThrowError(unauthorizedHttpError);

    console.log('Verifying Researcher1 CANNOT connect Environment1 using project3');
    await expect(
      rs1Session.resources.projects.project(project3Id).environments().environment(env1.id).connect()
    ).rejects.toThrowError(unauthorizedHttpError);
    // Connect
    await rs1Session.resources.projects.project(project1Id).environments().environment(env1.id).connect();
    // Stop
    await rs1Session.resources.projects.project(project1Id).environments().environment(env1.id).stop();

    console.log('Verifying Researcher1 CAN call all Environment APIs against Environment3...');
    await _waitForEnvironmentToReachState(
      rs1Session,
      project3Id,
      env3.id,
      'PENDING',
      'COMPLETED',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    );
    // Connect
    await rs1Session.resources.projects.project(project3Id).environments().environment(env3.id).connect();
    // Stop
    await rs1Session.resources.projects.project(project3Id).environments().environment(env3.id).stop();

    console.log('Verifying ITAdmin can call all other Environment APIs against Environment1...');
    // Start (expecting this to fail since the state is not STOPPED, but not due to unauthorized access)
    try {
      await adminSession.resources.projects.project(project2Id).environments().environment(env2.id).start();
    } catch (e) {
      expect(e).not.toEqual(unauthorizedHttpError);
    }
    await _waitForEnvironmentToReachState(
      adminSession,
      project2Id,
      env2.id,
      'PENDING',
      'COMPLETED',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    );
    // Stop
    await adminSession.resources.projects.project(project2Id).environments().environment(env2.id).stop();

    console.log('Verifying Researcher1 CAN see Dataset1...');
    const { data: researcherDS } = await rs1Session.resources.projects
      .project(project1Id)
      .dataSets()
      .dataset(ds1.id)
      .get();
    expect(researcherDS.id).toEqual(ds1.id);

    console.log('Verifying Researcher1 can terminate environment1...');
    await _waitForEnvironmentToReachState(
      rs1Session,
      project1Id,
      env1.id,
      'STOPPING',
      'STOPPED',
      ENVIRONMENT_STOP_MAX_WAITING_SECONDS
    );

    console.log('Verifying Researcher1 CANNOT start Environment1 using project3');
    await expect(
      rs1Session.resources.projects.project(project3Id).environments().environment(env1.id).start()
    ).rejects.toThrowError(unauthorizedHttpError);

    console.log('Verifying Researcher1 CANNOT terminate Environment1 using project3');
    await expect(
      rs1Session.resources.projects.project(project3Id).environments().environment(env1.id).terminate()
    ).rejects.toThrowError(unauthorizedHttpError);

    await rs1Session.resources.projects.project(project1Id).environments().environment(env1.id).terminate();

    console.log('Verifying ITAdmin can terminate environment2...');
    await _waitForEnvironmentToReachState(
      adminSession,
      project2Id,
      env2.id,
      'STOPPING',
      'STOPPED',
      ENVIRONMENT_STOP_MAX_WAITING_SECONDS
    );
    await adminSession.resources.projects.project(project2Id).environments().environment(env2.id).terminate();

    console.log('Verifying ITAdmin can terminate environment3...');
    await _waitForEnvironmentToReachState(
      adminSession,
      project3Id,
      env3.id,
      'STOPPING',
      'STOPPED',
      ENVIRONMENT_STOP_MAX_WAITING_SECONDS
    );
    await adminSession.resources.projects.project(project3Id).environments().environment(env3.id).terminate();

    console.log('Verifying Env1, Env2 and Env3 are terminated...');
    await _waitForEnvironmentToReachState(
      adminSession,
      project1Id,
      env1.id,
      'TERMINATING',
      'TERMINATED',
      ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
    );
    await _waitForEnvironmentToReachState(
      adminSession,
      project2Id,
      env2.id,
      'TERMINATING',
      'TERMINATED',
      ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
    );
    await _waitForEnvironmentToReachState(
      adminSession,
      project3Id,
      env3.id,
      'TERMINATING',
      'TERMINATED',
      ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
    );

    console.log('Disassociating Environment Type Configs from Projects...');
    await adminSession.resources.projects
      .project(project1Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .environmentTypeConfig(etc1.id)
      .disassociate();
    await adminSession.resources.projects
      .project(project2Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .environmentTypeConfig(etc2.id)
      .disassociate();
    await adminSession.resources.projects
      .project(project3Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .environmentTypeConfig(etc3.id)
      .disassociate();
    await adminSession.resources.projects
      .project(project4Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .environmentTypeConfig(etc4.id)
      .disassociate();
  });
});

async function _waitForEnvironmentToReachState(
  session: ClientSession,
  projectId: string,
  envId: string,
  transitionState: string,
  desiredState: string,
  timeout: number
): Promise<void> {
  console.log(`Waiting for Environment ${envId} is in state ${desiredState}...`);
  await poll(
    async () => session.resources.projects.project(projectId).environments().environment(envId).get(),
    (env) => env?.data?.status !== transitionState,
    timeout
  );
  const { data: env } = await session.resources.projects
    .project(projectId)
    .environments()
    .environment(envId)
    .get();
  expect(env).toMatchObject({
    id: expect.stringMatching(envUuidRegExp),
    status: desiredState,
    ETC: expect.anything(), //ETC should be defined
    PROJ: expect.anything() // PROJ should be defined
  });
  console.log(`Environment ${envId} reached state ${env.status}.`);
}
