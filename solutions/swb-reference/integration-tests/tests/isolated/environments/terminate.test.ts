import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('environment terminate negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.createAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('environment does not exist', async () => {
    try {
      await adminSession.resources.environments.environment('fakeEnv').terminate();
    } catch (e) {
      console.log('error is', e);
      checkHttpError(
        e,
        new HttpError(404, {
          statusCode: 404,
          error: 'Not Found',
          message: 'Could not find environment fakeEnv'
        })
      );
    }
  });

  test('terminate an environment that is already terminated should return a 204 and not change the environment status', async () => {
    const envId = setup.getSettings().get('alreadyTerminateEnvId');
    const terminateResponse = await adminSession.resources.environments.environment(envId).terminate();
    expect(terminateResponse.status).toEqual(204);

    const envDetailResponse = await adminSession.resources.environments.environment(envId).get();
    expect(envDetailResponse.data.status).toEqual('TERMINATED');
  });
});
