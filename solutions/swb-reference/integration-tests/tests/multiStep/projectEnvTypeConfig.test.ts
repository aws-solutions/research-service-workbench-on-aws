/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { EnvironmentTypeConfig } from '@aws/workbench-core-environments';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';

describe('multiStep project-environmentTypeConfig relationship', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const envTypeId = setup.getSettings().get('envTypeId');
  const envTypeConfigId = setup.getSettings().get('envTypeConfigId');
  const projectId = setup.getSettings().get('projectId');

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('create, list and delete Project association with Environment Type Config', async () => {
    //Create Environment A
    console.log('Associate Project with Environment Type Config');
    await expect(
      adminSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .associate()
    ).resolves.not.toThrow();

    //Retrieve etc association from project
    console.log('Retrieve etc association from project');
    const { data: response } = await adminSession.resources.projects
      .project(projectId)
      .environmentTypes()
      .environmentType(envTypeId)
      .configurations()
      .get({});
    expect(
      response.data.filter((projETC: EnvironmentTypeConfig) => projETC.id === envTypeConfigId).length
    ).toBeTruthy();

    console.log('Disassociate Project with Environment Type Config');
    await expect(
      adminSession.resources.projects
        .project(projectId)
        .environmentTypes()
        .environmentType(envTypeId)
        .configurations()
        .environmentTypeConfig(envTypeConfigId)
        .disassociate()
    ).resolves.not.toThrow();
  });
});
