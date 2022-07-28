import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('environment stop negative tests', () => {
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
      await adminSession.resources.environments.environment('fakeEnv').stop();
    } catch (e) {
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
});
