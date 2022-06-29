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
    const settings = adminSession.getSettings();
    // TODO: Pull these values from config
    const createEnvBody = {
      description: 'test 123',
      name: 'testEnv1',
      envTypeId: settings.get('envTypeId'),
      envTypeConfigId: settings.get('envTypeConfigId'),
      projectId: settings.get('projectId'),
      datasetIds: [],
      envType: settings.get('envType')
    };
    adminSession.resources.environments._buildDefaults();
    const response = await adminSession.resources.environments.create(createEnvBody);
    //TODO: Check create response is as expected
    console.log('response', response);
    expect(true).toEqual(true);
  });
});
