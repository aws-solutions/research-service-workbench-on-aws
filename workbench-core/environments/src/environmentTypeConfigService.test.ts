/* eslint-disable */
import EnvironmentTypeConfigService from './environmentTypeConfigService';

describe('environmentTypeConfigService', () => {
  const TABLE_NAME = 'swb-dev2-can';
  beforeAll(() => {
    process.env.AWS_REGION = 'ca-central-1';
  });
  test('foo', () => {
    expect(true).toEqual(true);
  });
  const envTypeId = '6c732e11-87fb-40e7-ae3b-2551658d78f0';
  const envTypeConfigId = '1b0502f3-121f-4d63-b03a-44dc756e4c20';
  const envTypeConfigService = new EnvironmentTypeConfigService({ TABLE_NAME });

  // test('create', async () => {
  //   const params = {
  //     productId: 'prod-77ncg2cb3bx4g',
  //     provisioningArtifactId: 'pa-hs4ex4okpbl7e',
  //     allowRoleIds: [],
  //     type: 'sagemaker',
  //     description: 'Example config 1',
  //     name: 'config 1',
  //     params: []
  //   };
  //
  //   const response = await envTypeConfigService.createNewEnvironmentTypeConfig(
  //     'owner-123',
  //     envTypeId,
  //     params
  //   );
  //   console.log('response', response);
  // });
  //
  // test('update', async () => {
  //   const params = {
  //     description: 'Example config 2'
  //   };
  //
  //   const response = await envTypeConfigService.updateEnvironmentTypeConfig(
  //     'owner-123',
  //     envTypeId,
  //     envTypeConfigId,
  //     params
  //   );
  //   console.log('response', response);
  // });
  //
  // test('getAll', async () => {
  //   const response = await envTypeConfigService.getEnvironmentTypeConfigs(envTypeId);
  //   console.log('response', response);
  // });
  //
  // test('get one', async () => {
  //   const response = await envTypeConfigService.getEnvironmentTypeConfig(
  //     'owner-123',
  //     envTypeId,
  //     envTypeConfigId
  //   );
  //   console.log('response', response);
  // });
});
