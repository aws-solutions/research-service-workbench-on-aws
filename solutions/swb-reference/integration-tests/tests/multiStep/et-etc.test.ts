/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import ClientSession from '../../support/clientSession';
import { EnvironmentTypeHelper } from '../../support/complex/environmentTypeHelper';
import Setup from '../../support/setup';
import { DEFLAKE_DELAY_IN_MILLISECONDS } from '../../support/utils/constants';
import { envTypeConfigRegExp } from '../../support/utils/regExpressions';
import { sleep } from '../../support/utils/utilities';

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

    //Update Name for Environment Type
    console.log('Update Environment Type Name');
    await adminSession.resources.environmentTypes.environmentType(envType.id).update(
      {
        name: 'updated name'
      },
      true
    );
    const { data: updatedNameEnvType } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .get();
    expect(updatedNameEnvType).toMatchObject({
      name: 'updated name'
    });

    //Update description for Environment Type
    console.log('Update Environment Type Description');
    await adminSession.resources.environmentTypes.environmentType(envType.id).update(
      {
        description: 'updated description'
      },
      true
    );
    const { data: updatedDescEnvType } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .get();
    expect(updatedDescEnvType).toMatchObject({
      description: 'updated description'
    });

    //Create Environment Type Config
    console.log('Creating Environment Type Config');
    const { data: envTypeConfig } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .configurations()
      .create({}, true);
    expect(envTypeConfig).toMatchObject({
      id: expect.stringMatching(envTypeConfigRegExp)
    });

    //Update Environment Type Config
    console.log('Update Environment Type Config');
    await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .configurations()
      .environmentTypeConfig(envTypeConfig.id)
      .update(
        {
          description: 'new Description',
          estimatedCost: 'new Estimated Cost'
        },
        true
      );
    const { data: updatedEnvTypeConfig } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .configurations()
      .environmentTypeConfig(envTypeConfig.id)
      .get();
    expect(updatedEnvTypeConfig).toMatchObject({
      description: 'new Description',
      estimatedCost: 'new Estimated Cost'
    });
    //Delete Environment Type Config
    console.log('Delete Environment Type Config');
    await expect(
      adminSession.resources.environmentTypes
        .environmentType(envType.id)
        .configurations()
        .environmentTypeConfig(envTypeConfig.id)
        .delete()
    ).resolves;

    await sleep(DEFLAKE_DELAY_IN_MILLISECONDS); //avoid throttle and give time to ddb to soft delete ETC dependency
    //Revoke Environment Type
    console.log('Revoke Environment Type');
    await adminSession.resources.environmentTypes.environmentType(envType.id).update(
      {
        status: 'NOT_APPROVED'
      },
      true
    );
    const { data: revokedEnvType } = await adminSession.resources.environmentTypes
      .environmentType(envType.id)
      .get();
    expect(revokedEnvType).toMatchObject({
      status: 'NOT_APPROVED'
    });

    //Delete Environment Type
    console.log('Delete Environment Type');
    await expect(envTypeHandler.deleteEnvironmentType(envType.id)).resolves;
  });
});
