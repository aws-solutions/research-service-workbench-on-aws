/* eslint-disable */
import EnvironmentService from './environmentService';

describe('EnvironmentService', () => {
  const TABLE_NAME = 'swb-dev-oh';
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-2';
  });
  test('getEnvironment, includeMetadata = true', async () => {
    const environmentService = new EnvironmentService({
      TABLE_NAME
    });
    const data = await environmentService.getEnvironment('88a43754-4139-4786-b2cf-a037b39890fa', true);
    console.log('data', data);
  });
  test('getEnvironment, includeMetadata = false', async () => {
    const environmentService = new EnvironmentService({
      TABLE_NAME
    });
    const data = await environmentService.getEnvironment('88a43754-4139-4786-b2cf-a037b39890fa', false);
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
    const data = await environmentService.createEnv({
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
      status: 'COMPLETED'
    });
    console.log('data', data);
  });
  test('updateEnvironment', async () => {
    const environmentService = new EnvironmentService({ TABLE_NAME });
    const data = await environmentService.updateEnvironment('88a43754-4139-4786-b2cf-a037b39890fa', {
      instance: 'instance-124',
      status: 'COMPLETED'
    });
    console.log('data', data);
  });
});
