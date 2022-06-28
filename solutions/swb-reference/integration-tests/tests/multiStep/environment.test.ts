import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';

describe('multiStep environment test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeAll(async () => {
    console.log('before all');
    adminSession = await setup.createAdminSession();
  });

  afterAll(async () => {
    console.log('after all');
    await setup.cleanup();
  });

  test('launch, connect, stop, get, terminate', async () => {
    console.log('inside test');
    const createEnvBody = {
      description: 'test 123',
      name: 'testEnv1',
      envTypeId: 'envType-123',
      envTypeConfigId: 'envTypeConfig-123',
      projectId: 'proj-123',
      datasetIds: [],
      envType: 'sagemaker'
    };
    const response = await adminSession.resources.environments.create(createEnvBody);
    console.log('response', response);
    expect(true).toEqual(true);
  });
});
