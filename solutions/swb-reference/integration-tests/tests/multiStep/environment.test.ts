/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../support/clientSession';
import { ListEnvironmentResponse } from '../../support/models/environments';
import Setup from '../../support/setup';
import {
  ENVIRONMENT_START_MAX_WAITING_SECONDS,
  ENVIRONMENT_STOP_MAX_WAITING_SECONDS,
  ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
} from '../../support/utils/constants';
import { envUuidRegExp } from '../../support/utils/regExpressions';
import { poll } from '../../support/utils/utilities';

describe('multiStep environment test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('launch, connect, stop, get, terminate', async () => {
    //Create Environment A
    console.log('Creating Environment A');
    const { data: environmentA } = await adminSession.resources.environments.create();
    expect(environmentA).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      instanceId: '', // empty string because instanceId value has not been propagated by statusHandler yet
      provisionedProductId: '', // empty string because provisionedProductId  has not been propagated by statusHandler yet
      status: 'PENDING',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    const projectId = environmentA.projectId;

    //Create Environment B
    console.log('Creating Environment B');
    const { data: environmentB } = await adminSession.resources.environments.create();
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
      async () => adminSession.resources.environments.environment(environmentA.id).get(),
      (env) => env?.data?.status !== 'PENDING',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    ); //wait for environmentA to complete
    const { data: environmentACompleted } = await adminSession.resources.environments
      .environment(environmentA.id)
      .get();
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
      async () => adminSession.resources.environments.environment(environmentB.id).get(),
      (env) => env?.data?.status !== 'PENDING',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    ); //wait for environmentB to complete
    const { data: environmentBCompleted } = await adminSession.resources.environments
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
    const { data: environmentAConnectInfo } = await adminSession.resources.environments
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
    await adminSession.resources.environments.environment(environmentA.id).stop();
    await poll(
      async () => adminSession.resources.environments.environment(environmentA.id).get(),
      (env) => env?.data?.status !== 'STOPPING',
      ENVIRONMENT_STOP_MAX_WAITING_SECONDS
    ); //wait for environmentA to stop
    const { data: environmentAStopped } = await adminSession.resources.environments
      .environment(environmentA.id)
      .get();
    expect(environmentAStopped).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      status: 'STOPPED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment A Stopped');

    //Search Environment A filtering by name
    console.log('Searching for Environment A: filtering by "name"');
    const { data: environmentsNameFilter }: ListEnvironmentResponse =
      await adminSession.resources.environments.get({
        name: environmentAStopped.name
      });
    expect(
      environmentsNameFilter.data.filter((env) => env.id === environmentAStopped.id).length
    ).toBeTruthy();

    //Search Environment A filtering by status
    console.log('Searching for Environment A: filtering by "status"');
    const { data: environmentsStatusFilter }: ListEnvironmentResponse =
      await adminSession.resources.environments.get({
        status: environmentAStopped.status
      });
    expect(
      environmentsStatusFilter.data.filter((env) => env.id === environmentAStopped.id).length
    ).toBeTruthy();

    //Search Environment A filtering by created at
    console.log('Searching for Environment A: filtering by "createdAt"');
    const { data: environmentsCreatedAtFilter }: ListEnvironmentResponse =
      await adminSession.resources.environments.get({
        createdAtFrom: environmentAStopped.createdAt,
        createdAtTo: environmentAStopped.createdAt
      });
    expect(
      environmentsCreatedAtFilter.data.filter((env) => env.id === environmentAStopped.id).length
    ).toBeTruthy();

    //Search Environment A filtering by owner
    console.log('Searching for Environment A: filtering by "owner"');
    const { data: environmentsOwnerFilter }: ListEnvironmentResponse =
      await adminSession.resources.environments.get({
        owner: environmentAStopped.owner
      });
    expect(
      environmentsOwnerFilter.data.filter((env) => env.id === environmentAStopped.id).length
    ).toBeTruthy();

    //Start Environment A after being stopped
    console.log('Starting Environment A after being stopped');
    await adminSession.resources.environments.environment(environmentA.id).start();
    await poll(
      async () => adminSession.resources.environments.environment(environmentA.id).get(),
      (env) => env?.data?.status !== 'PENDING' && env?.data?.status !== 'STARTING',
      ENVIRONMENT_START_MAX_WAITING_SECONDS
    ); //wait for environmentA to complete
    const { data: environmentAStarted } = await adminSession.resources.environments
      .environment(environmentA.id)
      .get();
    expect(environmentAStarted).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      status: 'COMPLETED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment A Completed');

    //Stop Environments A and B
    console.log(`Stopping Environments A: ${environmentA.id}`);
    await adminSession.resources.environments.environment(environmentA.id).stop();
    console.log(`Stopping Environments B: ${environmentB.id}`);
    await adminSession.resources.environments.environment(environmentB.id).stop();

    //Wait for Environment A to stop
    await poll(
      async () => adminSession.resources.environments.environment(environmentA.id).get(),
      (env) => env?.data?.status !== 'STOPPING',
      ENVIRONMENT_STOP_MAX_WAITING_SECONDS
    ); //wait for environmentA to stop
    const { data: environmentAStopped2 } = await adminSession.resources.environments
      .environment(environmentA.id)
      .get();
    expect(environmentAStopped2).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      status: 'STOPPED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment A Stopped');

    //Wait for Environment B to stop
    await poll(
      async () => adminSession.resources.environments.environment(environmentB.id).get(),
      (env) => env?.data?.status !== 'STOPPING',
      ENVIRONMENT_STOP_MAX_WAITING_SECONDS
    ); //wait for environmentB to stop
    const { data: environmentBStopped } = await adminSession.resources.environments
      .environment(environmentB.id)
      .get();
    expect(environmentBStopped).toMatchObject({
      id: expect.stringMatching(envUuidRegExp),
      status: 'STOPPED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment B Stopped');

    //Terminate Environments A and B
    console.log('Terminating Environments A and B');
    await adminSession.resources.environments.environment(environmentA.id).terminate();
    await adminSession.resources.environments.environment(environmentB.id).terminate();

    //Wait for Environments A and B to terminate
    await poll(
      async () => adminSession.resources.environments.environment(environmentA.id).get(),
      (env) => env?.data?.status !== 'TERMINATING',
      ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
    ); //wait for environmentA to Terminate
    await poll(
      async () => adminSession.resources.environments.environment(environmentB.id).get(),
      (env) => env?.data?.status !== 'TERMINATING',
      ENVIRONMENT_TERMINATE_MAX_WAITING_SECONDS
    ); //wait for environmentB to Terminate
    //Validate Environments A and B are not retrieved on get all environments call
    console.log('Check that terminated environments are not shown when listing all environments');
    const { data: allEnvironments }: ListEnvironmentResponse = await adminSession.resources.environments.get(
      projectId
    );
    expect(
      allEnvironments.data.filter((env) => env.id === environmentA.id || env.id === environmentB.id).length
    ).toEqual(0);
  });
});
