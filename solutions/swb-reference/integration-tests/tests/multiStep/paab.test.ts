/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { CreateDataSetRequestParser } from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
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
import { poll } from '../../support/utils/utilities';

describe('multiStep environment test', () => {
  const paabHelper: PaabHelper = new PaabHelper();
  const setup: Setup = Setup.getSetup();
  const settings: Settings = setup.getSettings();
  const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
  const etId: string = settings.get('envTypeId');
  const type: string = settings.get('envType');
  const forbiddenHttpError = new HttpError(403, { error: 'User is not authorized' });
  const notFoundHttpError = (envId: string, projId: string): HttpError =>
    new HttpError(404, { error: `Couldnt find environment ${envId} with project ${projId}` });
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
  let rs1Session: ClientSession;

  beforeAll(async () => {
    ({ adminSession, pa1Session, pa2Session, project1Id, project2Id, project3Id, rs1Session } =
      await paabHelper.createResources(__filename));
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
    const { data: env3 } = await rs1Session.resources.projects
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
      type: 'internal'
    });
    const { data: ds1 } = await pa1Session.resources.projects
      .project(project1Id)
      .dataSets()
      .create(dataSetBody, false);

    console.log('Test to ensure access is given immediately when a user is added to a project');

    console.log('Verifying PA2 CANNOT see Project3...');
    const { data: pa2Projects }: ListProjectsResponse = await pa2Session.resources.projects.get();
    expect(pa2Projects.data.filter((proj) => proj.id === project3Id).length).toEqual(0);

    // Get Projects
    await expect(pa2Session.resources.projects.project(project3Id).get()).rejects.toThrowError(
      forbiddenHttpError
    );

    console.log('Verifying PA2 CANNOT see ETC3');
    await expect(
      pa2Session.resources.projects
        .project(project3Id)
        .environmentTypes()
        .environmentType(etId)
        .configurations()
        .environmentTypeConfig(etc3.id)
        .get()
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Adding PA2 to Project3 as a Project Admin');
    await adminSession.resources.projects
      .project(project3Id)
      .assignUserToProject(pa2Session.getUserId()!, { role: 'ProjectAdmin' });

    console.log('Verifying PA2 CAN see Project3...');
    const { data: updatedPa2Projects }: ListProjectsResponse = await pa2Session.resources.projects.get();
    expect(updatedPa2Projects.data.filter((proj) => proj.id === project3Id).length).toEqual(1);
    const { data: receivedProject3 } = await pa2Session.resources.projects.project(project3Id).get();

    expect(receivedProject3.id).toStrictEqual(project3Id);

    console.log('Verifying PA2 CAN see ETC3');
    const { data: receivedEtc3 } = await pa2Session.resources.projects
      .project(project3Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .environmentTypeConfig(etc3.id)
      .get();

    expect(receivedEtc3).toStrictEqual(etc3);

    console.log('Test to ensure access is revoked immediately when a user is removed from a project');

    console.log('Removing PA2 from Project3');
    await adminSession.resources.projects.project(project3Id).removeUserFromProject(pa2Session.getUserId()!);

    console.log('Verifying PA2 CANNOT see Project3');
    // Get Projects
    await expect(pa2Session.resources.projects.project(project3Id).get()).rejects.toThrowError(
      forbiddenHttpError
    );

    console.log('Verifying PA2 CANNOT see ETC3');
    await expect(
      pa2Session.resources.projects
        .project(project3Id)
        .environmentTypes()
        .environmentType(etId)
        .configurations()
        .environmentTypeConfig(etc3.id)
        .get()
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Successfully completed immediate allowed and revoked project access');

    console.log('Verifying PA1 CANNOT see Project2...');
    // List Projects
    const { data: listProjects1 }: ListProjectsResponse = await pa1Session.resources.projects.get();
    expect(listProjects1.data.filter((proj) => proj.id === project2Id).length).toEqual(0);

    // Get Projects
    await expect(pa1Session.resources.projects.project(project2Id).get()).rejects.toThrowError(
      forbiddenHttpError
    );

    console.log('Verify PA1 CANNOT see ETC2...');
    // Get ETC
    await expect(
      pa1Session.resources.projects
        .project(project2Id)
        .environmentTypes()
        .environmentType(etId)
        .configurations()
        .environmentTypeConfig(etc2.id)
        .get()
    ).rejects.toThrowError(forbiddenHttpError);
    // List ETCs for Project
    const { data: listEtcs1 }: ListETCsResponse = await pa1Session.resources.projects
      .project(project1Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .get();
    expect(listEtcs1.data.filter((etc) => etc.id === etc2.id).length).toEqual(0);

    console.log('Verifying PA1 CANNOT create an Environment in Project2...');
    await expect(
      pa1Session.resources.projects.project(project2Id).environments().create()
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Verifying PA2 CANNOT see Project1...');
    // List Projects
    const { data: listProjects2 }: ListProjectsResponse = await pa2Session.resources.projects.get();
    expect(listProjects2.data.filter((proj) => proj.id === project1Id).length).toEqual(0);
    // Get Projects
    await expect(pa2Session.resources.projects.project(project1Id).get()).rejects.toThrowError(
      forbiddenHttpError
    );

    console.log('Verifying PA2 CANNOT see Project3...');
    // List Projects
    const { data: listProjects3 }: ListProjectsResponse = await pa2Session.resources.projects.get();
    expect(listProjects3.data.filter((proj) => proj.id === project3Id).length).toEqual(0);
    // Get Projects
    await expect(pa2Session.resources.projects.project(project3Id).get()).rejects.toThrowError(
      forbiddenHttpError
    );

    console.log('Verifying PA2 CANNOT see Dataset1...');
    // List Datasets for Project
    const { data: pa2Datasets }: ListDatasetsResponse = await pa2Session.resources.projects
      .project(project2Id)
      .dataSets()
      .get();
    expect(pa2Datasets.data.filter((ds) => ds.id === ds1.id).length).toEqual(0);
    // Get Dataset
    await expect(
      pa2Session.resources.projects.project(project1Id).dataSets().dataset(ds1.id).get()
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Verifying PA2 cannot upload files to Dataset1...');
    const fileName: string = 'file.txt';
    await expect(
      pa2Session.resources.projects.project(project1Id).dataSets().dataset(ds1.id).getFileUploadUrls(fileName)
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Verifying PA2 CANNOT see Environment1');
    // List Environments for Project
    const { data: pa2Environments }: ListEnvironmentResponse = await pa2Session.resources.projects
      .project(project2Id)
      .environments()
      .listProjectEnvironments();
    expect(pa2Environments.data.filter((env) => env.id === env1.id).length).toEqual(0);
    // Get Environment
    await expect(
      pa2Session.resources.projects.project(project1Id).environments().environment(env1.id).get()
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Verifying Researcher1 CANNOT see Project2...');
    // List Projects
    const { data: researcherProjects }: ListProjectsResponse = await rs1Session.resources.projects.get();
    expect(researcherProjects.data.filter((proj) => proj.id === project2Id).length).toEqual(0);
    // Get Projects
    await expect(rs1Session.resources.projects.project(project2Id).get()).rejects.toThrowError(
      forbiddenHttpError
    );

    console.log('Verifying Researcher1 CAN ONLY see Environment1 on project1 Request');
    // List Environments for Project
    const { data: researcherProj1Environments }: ListEnvironmentResponse = await rs1Session.resources.projects
      .project(project1Id)
      .environments()
      .listProjectEnvironments();
    expect(researcherProj1Environments.data.filter((env) => env.id === env1.id).length).toEqual(1);
    expect(researcherProj1Environments.data.filter((env) => env.id === env3.id).length).toEqual(0);

    console.log(
      'Verifying Researcher1 CANNOT see Environment1 on single GET request using project3, even if they have access to both projects'
    );
    await expect(
      rs1Session.resources.projects.project(project3Id).environments().environment(env1.id).get()
    ).rejects.toThrowError(notFoundHttpError(env1.id, project3Id));

    console.log('Verifying Researcher1 CAN ONLY see Environment3 on project3 Request');
    // List Environments for Project
    const { data: researcherProj3Environments }: ListEnvironmentResponse = await rs1Session.resources.projects
      .project(project3Id)
      .environments()
      .listProjectEnvironments();
    expect(researcherProj3Environments.data.filter((env) => env.id === env3.id).length).toEqual(1);
    expect(researcherProj3Environments.data.filter((env) => env.id === env1.id).length).toEqual(0);

    // ============= Researcher1 negative tests BEGIN =============
    console.log(
      'Verifying Researcher1 CANNOT see Environment2, linked to a project that Researcher1 does not have access to...'
    );
    // List Environments for Project
    const { data: researcherEnvironments }: ListEnvironmentResponse = await rs1Session.resources.projects
      .project(project1Id)
      .environments()
      .listProjectEnvironments();
    expect(researcherEnvironments.data.filter((env) => env.id === env2.id).length).toEqual(0);
    // Get Environment
    await expect(
      rs1Session.resources.projects.project(project2Id).environments().environment(env2.id).get()
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Verifying Researcher1 CANNOT call any Environment APIs against Environment2 with Project2');
    // Connect
    await expect(
      rs1Session.resources.projects.project(project2Id).environments().environment(env2.id).connect()
    ).rejects.toThrowError(forbiddenHttpError);
    // Start
    await expect(
      rs1Session.resources.projects.project(project2Id).environments().environment(env2.id).start()
    ).rejects.toThrowError(forbiddenHttpError);
    // Stop
    await expect(
      rs1Session.resources.projects.project(project2Id).environments().environment(env2.id).stop()
    ).rejects.toThrowError(forbiddenHttpError);
    // Terminate
    await expect(
      rs1Session.resources.projects.project(project2Id).environments().environment(env2.id).terminate()
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Verifying Researcher1 CANNOT call any Environment APIs against Environment2 with Project1');
    // Connect
    await expect(
      rs1Session.resources.projects.project(project1Id).environments().environment(env2.id).connect()
    ).rejects.toThrowError(forbiddenHttpError);
    // Start
    await expect(
      rs1Session.resources.projects.project(project1Id).environments().environment(env2.id).start()
    ).rejects.toThrowError(forbiddenHttpError);
    // Stop
    await expect(
      rs1Session.resources.projects.project(project1Id).environments().environment(env2.id).stop()
    ).rejects.toThrowError(forbiddenHttpError);
    // Terminate
    await expect(
      rs1Session.resources.projects.project(project1Id).environments().environment(env2.id).terminate()
    ).rejects.toThrowError(forbiddenHttpError);
    // ============= Researcher1 negative tests END =============

    // ============= PA1 negative tests BEGIN =============
    console.log('Verifying PA1 CANNOT call any Environment APIs against Environment2 with Project2');
    // Connect
    await expect(
      pa1Session.resources.projects.project(project2Id).environments().environment(env2.id).connect()
    ).rejects.toThrowError(forbiddenHttpError);
    // Start
    await expect(
      pa1Session.resources.projects.project(project2Id).environments().environment(env2.id).start()
    ).rejects.toThrowError(forbiddenHttpError);
    // Stop
    await expect(
      pa1Session.resources.projects.project(project2Id).environments().environment(env2.id).stop()
    ).rejects.toThrowError(forbiddenHttpError);
    // Terminate
    await expect(
      rs1Session.resources.projects.project(project2Id).environments().environment(env2.id).terminate()
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Verifying PA1 CANNOT call any Environment APIs against Environment2 with Project1');
    // Connect
    await expect(
      pa1Session.resources.projects.project(project1Id).environments().environment(env2.id).connect()
    ).rejects.toThrowError(forbiddenHttpError);
    // Start
    await expect(
      pa1Session.resources.projects.project(project1Id).environments().environment(env2.id).start()
    ).rejects.toThrowError(forbiddenHttpError);
    // Stop
    await expect(
      pa1Session.resources.projects.project(project1Id).environments().environment(env2.id).stop()
    ).rejects.toThrowError(forbiddenHttpError);
    // Terminate
    await expect(
      pa1Session.resources.projects.project(project1Id).environments().environment(env2.id).terminate()
    ).rejects.toThrowError(forbiddenHttpError);
    // ============= PA1 negative tests END =============

    console.log('Verifying Researcher1 CANNOT see ETC2...');
    // Get ETC
    await expect(
      rs1Session.resources.projects
        .project(project2Id)
        .environmentTypes()
        .environmentType(etId)
        .configurations()
        .environmentTypeConfig(etc2.id)
        .get()
    ).rejects.toThrowError(forbiddenHttpError);
    // List ETCs for Project
    const { data: rs1Etcs }: ListETCsResponse = await rs1Session.resources.projects
      .project(project1Id)
      .environmentTypes()
      .environmentType(etId)
      .configurations()
      .get();
    expect(rs1Etcs.data.filter((etc) => etc.id === etc2.id).length).toEqual(0);

    console.log('Verifying Researcher1 CANNOT create Environment in Project2...');
    await expect(
      rs1Session.resources.projects.project(project2Id).environments().create()
    ).rejects.toThrowError(forbiddenHttpError);

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
    await expect(
      adminSession.resources.projects
        .project(project1Id)
        .dataSets()
        .dataset(ds1.id)
        .getFileUploadUrls(fileName)
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Verifying ITAdmin CANNOT connect to Environment1...');
    await expect(
      adminSession.resources.projects.project(project2Id).environments().environment(env2.id).connect()
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Wait for all environments to complete creation');
    await Promise.all([
      _waitForEnvironmentToReachState(
        rs1Session,
        project1Id,
        env1.id,
        'COMPLETED',
        ENVIRONMENT_START_MAX_WAITING_SECONDS
      ),
      _waitForEnvironmentToReachState(
        adminSession,
        project2Id,
        env2.id,
        'COMPLETED',
        ENVIRONMENT_START_MAX_WAITING_SECONDS
      ),
      _waitForEnvironmentToReachState(
        rs1Session,
        project3Id,
        env3.id,
        'COMPLETED',
        ENVIRONMENT_START_MAX_WAITING_SECONDS
      )
    ]);

    console.log('Verifying Researcher1 CANNOT stop Environment1 using project3');
    await expect(
      rs1Session.resources.projects.project(project3Id).environments().environment(env1.id).stop()
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Verifying Researcher1 CANNOT connect Environment1 using project3');
    await expect(
      rs1Session.resources.projects.project(project3Id).environments().environment(env1.id).connect()
    ).rejects.toThrowError(forbiddenHttpError);
    // Connect
    await rs1Session.resources.projects.project(project1Id).environments().environment(env1.id).connect();
    // Stop
    await rs1Session.resources.projects.project(project1Id).environments().environment(env1.id).stop();

    console.log('Verifying Researcher1 CAN call all Environment APIs against Environment3...');
    // Connect
    await rs1Session.resources.projects.project(project3Id).environments().environment(env3.id).connect();
    // Stop
    await rs1Session.resources.projects.project(project3Id).environments().environment(env3.id).stop();

    console.log('Verifying ITAdmin CANNOT connect to Environment3');
    await expect(
      adminSession.resources.projects.project(project3Id).environments().environment(env3.id).connect()
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Verifying PA2 can connect to Environment2...');
    await pa2Session.resources.projects.project(project2Id).environments().environment(env2.id).connect();

    console.log('Verifying ITAdmin can call other Environment APIs against Environment2...');
    // Stop
    await adminSession.resources.projects.project(project2Id).environments().environment(env2.id).stop();

    console.log('Wait for all environments to be stopped');
    await Promise.all([
      _waitForEnvironmentToReachState(
        rs1Session,
        project1Id,
        env1.id,
        'STOPPED',
        ENVIRONMENT_STOP_MAX_WAITING_SECONDS
      ),
      _waitForEnvironmentToReachState(
        adminSession,
        project2Id,
        env2.id,
        'STOPPED',
        ENVIRONMENT_STOP_MAX_WAITING_SECONDS
      ),
      _waitForEnvironmentToReachState(
        adminSession,
        project3Id,
        env3.id,
        'STOPPED',
        ENVIRONMENT_STOP_MAX_WAITING_SECONDS
      )
    ]);

    console.log('Verifying Researcher1 CAN see Dataset1...');
    const { data: researcherDS } = await rs1Session.resources.projects
      .project(project1Id)
      .dataSets()
      .dataset(ds1.id)
      .get();
    expect(researcherDS.id).toEqual(ds1.id);

    console.log('Verifying Researcher1 CANNOT start Environment1 using project3');
    await expect(
      rs1Session.resources.projects.project(project3Id).environments().environment(env1.id).start()
    ).rejects.toThrowError(forbiddenHttpError);

    console.log('Verifying Researcher1 CANNOT terminate Environment1 using project3');
    await expect(
      rs1Session.resources.projects.project(project3Id).environments().environment(env1.id).terminate()
    ).rejects.toThrowError(forbiddenHttpError);

    // Testing environment operations with different users this time

    // Start
    console.log('Verifying Researcher1 CAN start Environment1 using project1');
    await rs1Session.resources.projects.project(project1Id).environments().environment(env1.id).start();
    console.log('Verifying PA2 CAN start Environment2 using project2');
    await pa2Session.resources.projects.project(project2Id).environments().environment(env2.id).start();
    console.log('Verifying ITAdmin CAN start Environment3 using project3');
    await adminSession.resources.projects.project(project3Id).environments().environment(env3.id).start();

    console.log('Wait for all environments to complete starting');
    await Promise.all([
      _waitForEnvironmentToReachState(
        rs1Session,
        project1Id,
        env1.id,
        'COMPLETED',
        ENVIRONMENT_START_MAX_WAITING_SECONDS
      ),
      _waitForEnvironmentToReachState(
        pa2Session,
        project2Id,
        env2.id,
        'COMPLETED',
        ENVIRONMENT_START_MAX_WAITING_SECONDS
      ),
      _waitForEnvironmentToReachState(
        adminSession,
        project3Id,
        env3.id,
        'COMPLETED',
        ENVIRONMENT_START_MAX_WAITING_SECONDS
      )
    ]);

    // Stop
    console.log('Verifying Researcher1 CAN stop Environment1 using project1');
    await rs1Session.resources.projects.project(project1Id).environments().environment(env1.id).stop();
    console.log('Verifying PA2 CAN stop Environment2 using project2');
    await pa2Session.resources.projects.project(project2Id).environments().environment(env2.id).stop();
    console.log('Verifying ITAdmin CAN stop Environment3 using project3');
    await adminSession.resources.projects.project(project3Id).environments().environment(env3.id).stop();

    console.log('Wait for all environments to be stopped');
    await Promise.all([
      _waitForEnvironmentToReachState(
        rs1Session,
        project1Id,
        env1.id,
        'STOPPED',
        ENVIRONMENT_STOP_MAX_WAITING_SECONDS
      ),
      _waitForEnvironmentToReachState(
        adminSession,
        project2Id,
        env2.id,
        'STOPPED',
        ENVIRONMENT_STOP_MAX_WAITING_SECONDS
      ),
      _waitForEnvironmentToReachState(
        adminSession,
        project3Id,
        env3.id,
        'STOPPED',
        ENVIRONMENT_STOP_MAX_WAITING_SECONDS
      )
    ]);

    console.log('Verifying Researcher1 can terminate Environment1 using project1');
    await rs1Session.resources.projects.project(project1Id).environments().environment(env1.id).terminate();

    console.log('Verifying PA2 can terminate environment2...');
    await pa2Session.resources.projects.project(project2Id).environments().environment(env2.id).terminate();

    console.log('Verifying ITAdmin can terminate environment3...');
    await adminSession.resources.projects.project(project3Id).environments().environment(env3.id).terminate();

    console.log('Verifying Env1, Env2 and Env3 are terminated...');
    await Promise.all([
      _waitForEnvironmentToReachState(
        adminSession,
        project1Id,
        env1.id,
        'TERMINATED',
        ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
      ),
      _waitForEnvironmentToReachState(
        adminSession,
        project2Id,
        env2.id,
        'TERMINATED',
        ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
      ),
      _waitForEnvironmentToReachState(
        adminSession,
        project3Id,
        env3.id,
        'TERMINATED',
        ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
      )
    ]);

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
  });
});

async function _waitForEnvironmentToReachState(
  session: ClientSession,
  projectId: string,
  envId: string,
  desiredState: string,
  timeout: number
): Promise<void> {
  console.log(`Waiting for Environment ${envId} is in state ${desiredState}...`);
  await poll(
    async () => session.resources.projects.project(projectId).environments().environment(envId).get(),
    (env) => env?.data?.status === desiredState || env?.data?.status.includes('FAIL'),
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
