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
  test('create', async () => {
    const envTypeConfigService = new EnvironmentTypeConfigService({ TABLE_NAME });

    const params = {
      envTypeId,
      productId: 'prod-77ncg2cb3bx4g',
      provisioningArtifactId: 'pa-hs4ex4okpbl7e',
      allowRoleIds: [],
      type: 'sagemaker',
      description: 'Example config 1',
      name: 'config 1',
      owner: 'owner-123',
      params: []
    };

    const response = await envTypeConfigService.createNewEnvironmentTypeConfig(params);
    console.log('response', response);
  });
});
