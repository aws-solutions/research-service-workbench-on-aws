/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../support/clientSession';
import { PaabHelper } from '../../support/complex/paabHelper';
import { ListEnvironmentResponse } from '../../support/models/environments';
import Environments from '../../support/resources/environments/environments';
import Setup from '../../support/setup';
import {
  ENVIRONMENT_START_MAX_WAITING_SECONDS,
  ENVIRONMENT_STOP_MAX_WAITING_SECONDS,
  ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
} from '../../support/utils/constants';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import { envUuidRegExp } from '../../support/utils/regExpressions';
import Settings from '../../support/utils/settings';
import { poll } from '../../support/utils/utilities';

describe('multiStep environment test', () => {
  const settings: Settings = Setup.getSetup().getSettings();
  const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
  const paabHelper: PaabHelper = new PaabHelper();
  let adminSession: ClientSession;
  let paSession: ClientSession;
  let projectId: string;

  beforeAll(async () => {
    const paabResources = await paabHelper.createResources();
    adminSession = paabResources.adminSession;
    paSession = paabResources.pa1Session;
    projectId = paabResources.project1Id;
  });

  afterAll(async () => {
    await paabHelper.cleanup();
  });

  /**
   * This test uses ProjectAdmin1 role to manage EnvironmentA and ITAdmin role to manage EnvironmentB after having been
   * created by PA1.
   * ListEnvironments is tested as ITAdmin.
   * Expect all APIs other than ListEnvironments to work for PA1 role.
   * Only Start, Stop, Terminate, Get, and ListEnvironments should work for ITAdmin.
   */
  test('launch, connect, stop, get, terminate', async () => {
    const adminSessionEnvironments: Environments = adminSession.resources.projects
      .project(projectId)
      .environments();
    const paSessionEnvironments: Environments = paSession.resources.projects
      .project(projectId)
      .environments();
    //Create Environment A
    console.log('Creating Environment A');
    const envABody = {
      envTypeId: settings.get('envTypeId'),
      envTypeConfigId: settings.get('envTypeConfigId'),
      envType: settings.get('envType'),
      datasetIds: [],
      name: randomTextGenerator.getFakeText('environment-multistep-test-envA'),
      description: 'EnvironmentA for multistep environment.test'
    };
    const { data: environmentA } = await paSessionEnvironments.create(envABody, false);
    expect(environmentA).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      instanceId: '', // empty string because instanceId value has not been propagated by statusHandler yet
      provisionedProductId: '', // empty string because provisionedProductId  has not been propagated by statusHandler yet
      status: 'PENDING',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });

    //Create Environment B
    console.log('Creating Environment B');
    const envBBody = {
      envTypeId: settings.get('envTypeId'),
      envTypeConfigId: settings.get('envTypeConfigId'),
      envType: settings.get('envType'),
      datasetIds: [],
      name: randomTextGenerator.getFakeText('environment-multistep-test-envB'),
      description: 'EnvironmentB for multistep environment.test'
    };
    const { data: environmentB } = await paSessionEnvironments.create(envBBody, false);
    expect(environmentB).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      instanceId: '', // empty string because instanceId value has not been propagated by statusHandler yet
      provisionedProductId: '', // empty string because provisionedProductId  has not been propagated by statusHandler yet
      status: 'PENDING',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });

    //Verify Environment A was started and is available
    console.log('Verify Environment A was started and is available');
    await poll(
      async () => paSessionEnvironments.environment(environmentA.id).get(),
      (env) => env?.data?.status !== 'PENDING',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    ); //wait for environmentA to complete
    const { data: environmentACompleted } = await paSessionEnvironments.environment(environmentA.id).get();
    expect(environmentACompleted).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      status: 'COMPLETED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment A Completed');

    //Verify Environment B was started and is available
    console.log('Verify Environment B was started and is available');
    await poll(
      async () => adminSessionEnvironments.environment(environmentB.id).get(),
      (env) => env?.data?.status !== 'PENDING',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    ); //wait for environmentB to complete
    const { data: environmentBCompleted } = await adminSession.resources.projects
      .project(projectId)
      .environments()
      .environment(environmentB.id)
      .get();
    expect(environmentBCompleted).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      status: 'COMPLETED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment B Completed');

    //Verify Connect Environment A
    console.log('Verify Connect Environment A');
    const { data: environmentAConnectInfo } = await paSessionEnvironments
      .environment(environmentA.id)
      .connect();
    expect(environmentAConnectInfo).toMatchObject({
      authCredResponse: {
        url: expect.anything()
      },
      instructionResponse: expect.anything()
    });

    //Stop Environment A
    console.log('Stopping Environment A');
    await paSessionEnvironments.environment(environmentA.id).stop();
    await poll(
      async () => paSessionEnvironments.environment(environmentA.id).get(),
      (env) => env?.data?.status !== 'STOPPING',
      ENVIRONMENT_STOP_MAX_WAITING_SECONDS
    ); //wait for environmentA to stop
    const { data: environmentAStopped } = await paSessionEnvironments.environment(environmentA.id).get();
    expect(environmentAStopped).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      status: 'STOPPED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment A Stopped');

    // Use ITAdmin to test ListEnvironments functionality

    //Search Environment A filtering by name
    console.log('Searching for Environment A: filtering by "name"');
    const { data: environmentsNameFilter }: ListEnvironmentResponse =
      await adminSession.resources.environments.get({
        filter: { name: { eq: environmentAStopped.name } }
      });
    expect(
      environmentsNameFilter.data.filter((env) => env.id === environmentAStopped.id).length
    ).toBeTruthy();

    //Search Environment A filtering by status
    console.log('Searching for Environment A: filtering by "status"');
    const { data: environmentsStatusFilter }: ListEnvironmentResponse =
      await adminSession.resources.environments.get({
        filter: { status: { eq: environmentAStopped.status } }
      });
    expect(
      environmentsStatusFilter.data.filter((env) => env.id === environmentAStopped.id).length
    ).toBeTruthy();

    //Search Environment A filtering by created at
    console.log('Searching for Environment A: filtering by "createdAt"');
    const { data: environmentsCreatedAtFilter }: ListEnvironmentResponse =
      await adminSession.resources.environments.get({
        filter: {
          createdAt: {
            between: { value1: environmentAStopped.createdAt, value2: environmentAStopped.createdAt }
          }
        }
      });
    expect(
      environmentsCreatedAtFilter.data.filter((env) => env.id === environmentAStopped.id).length
    ).toBeTruthy();

    //Search Environment A filtering by owner
    console.log('Searching for Environment A: filtering by "owner"');
    const { data: environmentsOwnerFilter }: ListEnvironmentResponse =
      await adminSession.resources.environments.get({
        filter: { owner: { eq: environmentAStopped.owner } }
      });
    expect(
      environmentsOwnerFilter.data.filter((env) => env.id === environmentAStopped.id).length
    ).toBeTruthy();

    //Start Environment A after being stopped
    console.log('Starting Environment A after being stopped');
    await paSessionEnvironments.environment(environmentA.id).start();
    await poll(
      async () => paSessionEnvironments.environment(environmentA.id).get(),
      (env) => env?.data?.status !== 'PENDING' && env?.data?.status !== 'STARTING',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    ); //wait for environmentA to complete
    const { data: environmentAStarted } = await adminSessionEnvironments.environment(environmentA.id).get();
    expect(environmentAStarted).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      status: 'COMPLETED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment A Completed');

    //Stop Environments A and B
    console.log(`Stopping Environments A: ${environmentA.id}`);
    await paSessionEnvironments.environment(environmentA.id).stop();
    console.log(`Stopping Environments B: ${environmentB.id}`);
    await adminSessionEnvironments.environment(environmentB.id).stop();

    //Wait for Environment A to stop
    await poll(
      async () => paSessionEnvironments.environment(environmentA.id).get(),
      (env) => env?.data?.status !== 'STOPPING',
      ENVIRONMENT_STOP_MAX_WAITING_SECONDS
    ); //wait for environmentA to stop
    const { data: environmentAStopped2 } = await paSessionEnvironments.environment(environmentA.id).get();
    expect(environmentAStopped2).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      status: 'STOPPED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment A Stopped');

    //Wait for Environment B to stop
    await poll(
      async () => adminSessionEnvironments.environment(environmentB.id).get(),
      (env) => env?.data?.status !== 'STOPPING',
      ENVIRONMENT_STOP_MAX_WAITING_SECONDS
    ); //wait for environmentB to stop
    const { data: environmentBStopped } = await adminSessionEnvironments.environment(environmentB.id).get();
    expect(environmentBStopped).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      status: 'STOPPED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment B Stopped');

    //Terminate Environments A and B
    console.log('Terminating Environments A and B');
    await paSessionEnvironments.environment(environmentA.id).terminate();
    await adminSessionEnvironments.environment(environmentB.id).terminate();

    //Wait for Environments A and B to terminate
    await poll(
      async () => paSessionEnvironments.environment(environmentA.id).get(),
      (env) => env?.data?.status !== 'TERMINATING',
      ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
    ); //wait for environmentA to Terminate
    await poll(
      async () => adminSessionEnvironments.environment(environmentB.id).get(),
      (env) => env?.data?.status !== 'TERMINATING',
      ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
    ); //wait for environmentB to Terminate
    //Validate Environments A and B are not retrieved on get all environments call
    console.log('Check that terminated environments are not shown when listing all environments');
    const { data: allEnvironments }: ListEnvironmentResponse = await adminSession.resources.projects
      .project(projectId)
      .environments()
      .listProjectEnvironments();
    expect(
      allEnvironments.data.filter((env) => env.id === environmentA.id || env.id === environmentB.id).length
    ).toEqual(0);

    // Verify terminating already terminated environments return 204
    let terminatedResponse = await paSessionEnvironments.environment(environmentA.id).terminate();
    expect(terminatedResponse.status).toEqual(204);
    let envDetailResponse = await paSessionEnvironments.environment(environmentA.id).get();
    expect(envDetailResponse.data.status).toEqual('TERMINATED');
    terminatedResponse = await adminSessionEnvironments.environment(environmentB.id).terminate();
    expect(terminatedResponse.status).toEqual(204);
    envDetailResponse = await adminSessionEnvironments.environment(environmentB.id).get();
    expect(envDetailResponse.data.status).toEqual('TERMINATED');
  });
});
