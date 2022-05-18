/* eslint-disable */
import EnvironmentService from './environmentService';

describe('EnvironmentService', () => {
  const TABLE_NAME = 'swb-dev-oh';
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-2';
  });

  const envId = '6c514a47-1152-4f2b-bee9-5a77e0cbd1fe';
  test('getEnvironment, includeMetadata = true', async () => {
    const environmentService = new EnvironmentService({
      TABLE_NAME
    });
    const data = await environmentService.getEnvironment(envId, true);
    console.log('data', data);
  });

  test('getEnvironment, includeMetadata = false', async () => {
    const environmentService = new EnvironmentService({
      TABLE_NAME
    });
    const data = await environmentService.getEnvironment(envId, false);
    console.log('data', data);
  });

  test('getEnvironments as admin', async () => {
    const environmentService = new EnvironmentService({ TABLE_NAME });
    const data = await environmentService.getEnvironments({ role: 'admin', ownerId: 'abc' });
    console.log('data', data);
  });

  test('getEnvironments as admin, filtered by pending', async () => {
    const environmentService = new EnvironmentService({ TABLE_NAME });
    const data = await environmentService.getEnvironments(
      { role: 'admin', ownerId: 'abc' },
      {
        status: 'PENDING'
      }
    );
    console.log('data', data);
  });
  test('createEnvironment', async () => {
    const environmentService = new EnvironmentService({ TABLE_NAME });
    const data = await environmentService.createEnvironment({
      // instance: 'instance-123',
      cidr: '0.0.0.0/0',
      description: 'test 123',
      // error: undefined,
      name: 'testEnv',
      outputs: [],
      envTypeId: 'envType-123',
      envTypeConfigId: 'envTypeConfig-123',
      projectId: 'proj-123',
      datasetIds: ['dataset-123'],
      status: 'PENDING'
    });
    console.log('data', data);
  });

  test('updateEnvironment', async () => {
    const environmentService = new EnvironmentService({ TABLE_NAME });
    const data = await environmentService.updateEnvironment(envId, {
      instance: 'instance-124',
      status: 'COMPLETED'
    });
    console.log('data', data);
  });
});
