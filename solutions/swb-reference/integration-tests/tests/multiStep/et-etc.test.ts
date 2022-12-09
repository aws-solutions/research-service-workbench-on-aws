/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import ClientSession from '../../support/clientSession';
import { EnvironmentTypeHelper } from '../../support/complex/environmentTypeHelper';
import Setup from '../../support/setup';
import { envTypeConfigRegExp } from '../../support/utils/regExpressions';

describe('multiStep environment type and environment type config test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  const envTypeHandler = new EnvironmentTypeHelper();
  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('create Environment Type', async () => {
    //Create Environment A
    console.log('Creating Environment Type');
    const envType = await envTypeHandler.createEnvironmentType('prod-1234567890123', 'pa-1234567890123');
    const expectedId = `${resourceTypeToKey.envType.toLowerCase()}-prod-1234567890123,pa-1234567890123`;
    expect(envType).toMatchObject({
      id: expectedId,
      status: 'NOT_APPROVED'
    });

    //Approve Environment Type
    console.log('Approve Environment Type');
    await adminSession.resources.environmentTypes.environmentType(envType.id).update(
      {
        status: 'APPROVED'
      },
      true
    );
    const { data: approvedEnvType } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .get();
    expect(approvedEnvType).toMatchObject({
      status: 'APPROVED'
    });

    //Create Environment Type Config
    console.log('Creating Environment Type Config');
    const { data: envTypeConfig } = await adminSession.resources.environmentTypeConfigs.create(
      {},
      true,
      envType.id
    );
    expect(envTypeConfig).toMatchObject({
      id: expect.stringMatching(envTypeConfigRegExp)
    });

    //Update Environment Type Config
    console.log('Update Environment Type Config');
    await adminSession.resources.environmentTypeConfigs
      .environmentTypeConfig(envTypeConfig.id, envType.id)
      .update(
        {
          description: 'new Description',
          estimatedCost: 'new Estimated Cost'
        },
        true
      );
    const { data: updatedEnvTypeConfig } = await adminSession.resources.environmentTypeConfigs
      .environmentTypeConfig(envTypeConfig.id, envType.id)
      .get();
    expect(updatedEnvTypeConfig).toMatchObject({
      description: 'new Description',
      estimatedCost: 'new Estimated Cost'
    });
    //Delete Environment Type Config
    console.log('Delete Environment Type Config');
    await expect(
      adminSession.resources.environmentTypeConfigs
        .environmentTypeConfig(envTypeConfig.id, envType.id)
        .delete()
    ).resolves;

    //Delete Environment Type
    console.log('Delete Environment Type');
    await expect(envTypeHandler.deleteEnvironmentType(envType.id)).resolves;
  });
});
