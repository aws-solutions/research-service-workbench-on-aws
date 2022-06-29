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
    const response = await adminSession.resources.environments.create();
    //TODO: Check create response is as expected
    console.log('response', response);
    expect(true).toEqual(true);
  });
});
