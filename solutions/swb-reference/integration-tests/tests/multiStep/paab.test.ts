/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { CreateDataSetRequestParser } from '@aws/swb-app/lib/dataSets/createDataSetRequestParser';
import { getProjectAdminRole, getResearcherRole } from '../../../src/utils/roleUtils';
import ClientSession from '../../support/clientSession';
import { PaabHelper } from '../../support/complex/paabHelper';
import { ListEnvironmentResponse } from '../../support/models/environments';
import { ListETCsResponse } from '../../support/models/environmentTypeConfigs';
import { ListProjectsResponse } from '../../support/models/projects';
import Setup from '../../support/setup';
import {
  ENVIRONMENT_START_MAX_WAITING_SECONDS,
  ENVIRONMENT_STOP_MAX_WAITING_SECONDS
} from '../../support/utils/constants';
import HttpError from '../../support/utils/HttpError';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import { envUuidRegExp } from '../../support/utils/regExpressions';
import { checkHttpError, poll } from '../../support/utils/utilities';

jest.retryTimes(0);

describe('multiStep environment test', () => {
  const paabHelper: PaabHelper = new PaabHelper();
  const setup: Setup = new Setup();
  const etId: string = setup.getSettings().get('envTypeId');
  const unauthorizedHttpError = new HttpError(403, { error: 'User is not authorized' });
  let adminSession: ClientSession;
  let pa1Session: ClientSession;
  let pa2Session: ClientSession;
  let project1Id: string;
  let project2Id: string;
  let rs1Session: ClientSession;

  beforeAll(async () => {
    ({ adminSession, pa1Session, pa2Session, project1Id, project2Id, rs1Session } =
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
      .create();
    const { data: etc2 } = await adminSession.resources.environmentTypes
      .environmentType(etId)
      .configurations()
      .create();

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

    console.log('Creating Environment1 for Project1...');
    const { data: env1 } = await pa1Session.resources.projects.project(project1Id).environments().create();

    console.log('Creating Environment2 for Project2...');
    const { data: env2 } = await pa2Session.resources.projects.project(project2Id).environments().create();

    console.log('Creating Dataset1 for Project1...');
    const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));
    const datasetName = randomTextGenerator.getFakeText('paab-test');
    const dataSetBody = CreateDataSetRequestParser.parse({
      storageName: setup.getSettings().get('DataSetsBucketName'),
      awsAccountId: setup.getSettings().get('mainAccountId'),
      path: datasetName, // using same name to help potential troubleshooting
      name: datasetName,
      region: setup.getSettings().get('awsRegion'),
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

    console.log('Verifying PA2 CANNOT see Dataset1...');
    // List Datasets for Project
    // const { data: pa2Datasets }: ListDatasetsResponse = await pa2Session.resources.projects
    //   .project(project2Id)
    //   .dataSets()
    //   .get()
    // expect(
    //   pa2Datasets.data.filter((ds) => ds.id === ds1.id).length
    // ).toEqual(0);
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
    // Connect
    await rs1Session.resources.projects.project(project1Id).environments().environment(env1.id).connect();
    // Stop
    await rs1Session.resources.projects.project(project1Id).environments().environment(env1.id).stop();

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
