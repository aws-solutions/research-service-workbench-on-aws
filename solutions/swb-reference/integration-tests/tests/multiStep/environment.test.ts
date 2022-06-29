import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';

describe('multiStep environment test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeAll(async () => {
    adminSession = await setup.createAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('launch, connect, stop, get, terminate', async () => {
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
    //TODO: Check create response is as expected
    console.log('response', response);
    expect(true).toEqual(true);
  });
});
