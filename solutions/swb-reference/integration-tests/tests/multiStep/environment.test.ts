/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import {
  ENVIRONMENT_START_MAX_WAITING_SECONDS,
  ENVIRONMENT_STOP_AND_TERMINATE_MAX_WAITING_SECONDS,
  ENVIRONMENT_STOP_MAX_WAITING_SECONDS
} from '../../support/utils/constants';
import { uuidRegExp } from '../../support/utils/regExpressions';

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
      id: expect.stringMatching(uuidRegExp),
      instanceId: '', // empty string because instanceId value has not been propagated by statusHandler yet
      provisionedProductId: '', // empty string because provisionedProductId  has not been propagated by statusHandler yet
      status: 'PENDING',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });

    //Create Environment B
    console.log('Creating Environment B');
    const { data: environmentB } = await adminSession.resources.environments.create();
    expect(environmentB).toMatchObject({
      id: expect.stringMatching(uuidRegExp),
      instanceId: '', // empty string because instanceId value has not been propagated by statusHandler yet
      provisionedProductId: '', // empty string because provisionedProductId  has not been propagated by statusHandler yet
      status: 'PENDING',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });

    //Verify Completed Environment A
    console.log('Verify Completed Environment A');
    await adminSession.resources.environments
      .environment(environmentA.id)
      .pollEnvironment(15, ENVIRONMENT_START_MAX_WAITING_SECONDS, (env) => env.status === 'PENDING'); //wait for environmentA to complete
    const { data: environmentACompleted } = await adminSession.resources.environments
      .environment(environmentA.id)
      .get();
    expect(environmentACompleted).toMatchObject({
      id: expect.stringMatching(uuidRegExp),
      status: 'COMPLETED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment A Completed');

    //Verify Completed Environment B
    console.log('Verify Completed Environment B');
    await adminSession.resources.environments
      .environment(environmentB.id)
      .pollEnvironment(15, ENVIRONMENT_START_MAX_WAITING_SECONDS, (env) => env.status === 'PENDING'); //wait for environmentB to complete
    const { data: environmentBCompleted } = await adminSession.resources.environments
      .environment(environmentB.id)
      .get();
    expect(environmentBCompleted).toMatchObject({
      id: expect.stringMatching(uuidRegExp),
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
    await adminSession.resources.environments
      .environment(environmentA.id)
      .pollEnvironment(15, ENVIRONMENT_STOP_MAX_WAITING_SECONDS, (env) => env.status === 'STOPPING'); //wait for environmentA to stop
    const { data: environmentAStopped } = await adminSession.resources.environments
      .environment(environmentA.id)
      .get();
    expect(environmentAStopped).toMatchObject({
      id: expect.stringMatching(uuidRegExp),
      status: 'STOPPED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment A Stopped');

    //Search Environment A filtering by name
    console.log('Searching Environment A filtering by name');
    const { data: environmentsNameFilter } = await adminSession.resources.environments.get({
      name: environmentAStopped.name
    });
    expect(
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      environmentsNameFilter?.data?.filter((env: any) => env.id === environmentAStopped.id)?.length
    ).toBeTruthy();

    //Search Environment A filtering by status
    console.log('Searching Environment A filtering by status');
    const { data: environmentsStatusFilter } = await adminSession.resources.environments.get({
      status: environmentAStopped.status
    });
    expect(
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      environmentsStatusFilter?.data?.filter((env: any) => env.id === environmentAStopped.id)?.length
    ).toBeTruthy();

    //Search Environment A filtering by created at
    console.log('Searching Environment A filtering by created at');
    const { data: environmentsCreatedAtFilter } = await adminSession.resources.environments.get({
      createdAtFrom: environmentAStopped.createdAt,
      createdAtTo: environmentAStopped.createdAt
    });
    expect(
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      environmentsCreatedAtFilter?.data?.filter((env: any) => env.id === environmentAStopped.id)?.length
    ).toBeTruthy();

    //Search Environment A filtering by owner
    console.log('Searching Environment A filtering by owner');
    const { data: environmentsOwnerFilter } = await adminSession.resources.environments.get({
      owner: environmentAStopped.owner
    });
    expect(
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      environmentsOwnerFilter?.data?.filter((env: any) => env.id === environmentAStopped.id)?.length
    ).toBeTruthy();

    //Start Environment A after being stopped
    console.log('Starting Environment A after being stopped');
    await adminSession.resources.environments.environment(environmentA.id).start();
    await adminSession.resources.environments
      .environment(environmentA.id)
      .pollEnvironment(
        15,
        ENVIRONMENT_START_MAX_WAITING_SECONDS,
        (env) => env.status === 'PENDING' || env.status === 'STARTING'
      ); //wait for environmentA to complete
    const { data: environmentAStarted } = await adminSession.resources.environments
      .environment(environmentA.id)
      .get();
    expect(environmentAStarted).toMatchObject({
      id: expect.stringMatching(uuidRegExp),
      status: 'COMPLETED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment A Completed');

    //Stop Environments A and B
    console.log('Stopping Environments A and B');
    await adminSession.resources.environments.environment(environmentA.id).stop();
    await adminSession.resources.environments.environment(environmentB.id).stop();

    //Wait for stopeed status for Environment A
    await adminSession.resources.environments
      .environment(environmentA.id)
      .pollEnvironment(15, ENVIRONMENT_STOP_MAX_WAITING_SECONDS, (env) => env.status === 'STOPPING'); //wait for environmentA to stop
    const { data: environmentAStopped2 } = await adminSession.resources.environments
      .environment(environmentA.id)
      .get();
    expect(environmentAStopped2).toMatchObject({
      id: expect.stringMatching(uuidRegExp),
      status: 'STOPPED',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });
    console.log('Environment A Stopped');

    //Wait for stopeed status for Environment B
    await adminSession.resources.environments
      .environment(environmentB.id)
      .pollEnvironment(15, ENVIRONMENT_STOP_MAX_WAITING_SECONDS, (env) => env.status === 'STOPPING'); //wait for environmentB to stop
    const { data: environmentBStopped } = await adminSession.resources.environments
      .environment(environmentB.id)
      .get();
    expect(environmentBStopped).toMatchObject({
      id: expect.stringMatching(uuidRegExp),
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
    await adminSession.resources.environments
      .environment(environmentA.id)
      .pollEnvironment(
        15,
        ENVIRONMENT_STOP_AND_TERMINATE_MAX_WAITING_SECONDS,
        (env) => env?.status === 'TERMINATING'
      ); //wait for environmentA to stop
    await adminSession.resources.environments
      .environment(environmentB.id)
      .pollEnvironment(
        15,
        ENVIRONMENT_STOP_AND_TERMINATE_MAX_WAITING_SECONDS,
        (env) => env?.status === 'TERMINATING'
      ); //wait for environmentB to stop

    //Validate Environments A and B are not retrieved on get all environments call
    console.log('Searching Environment A filtering by owner');
    const { data: allEnvironments } = await adminSession.resources.environments.get({});
    expect(
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      allEnvironments?.data?.filter((env: any) => env.id === environmentA.id || env.id === environmentB.id)
        ?.length
    ).toBeFalsy();
  });
});
