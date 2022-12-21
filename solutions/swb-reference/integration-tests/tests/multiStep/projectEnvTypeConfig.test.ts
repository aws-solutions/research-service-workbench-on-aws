/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
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
