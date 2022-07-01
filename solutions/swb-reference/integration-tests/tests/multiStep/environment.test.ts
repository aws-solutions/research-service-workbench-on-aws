import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import { uuidRegExp } from '../../support/utils/regExpressions';

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
    const { data: response } = await adminSession.resources.environments.create();
    expect(response).toMatchObject({
      id: expect.stringMatching(uuidRegExp),
      instanceId: '', // empty string because instanceId value has not been propagated by statusHandler yet
      provisionedProductId: '', // empty string because provisionedProductId  has not been propagated by statusHandler yet
      status: 'PENDING',
      ETC: expect.anything(), //ETC should be defined
      PROJ: expect.anything() // PROJ should be defined
    });

    // TODO: Add connect, stop, get, terminate test
  });
});
