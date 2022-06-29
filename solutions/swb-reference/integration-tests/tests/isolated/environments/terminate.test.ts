import { beforeEach } from 'jest-circus';
import ClientSession from '../../../support/clientSession';
import Setup from '../../../support/setup';
import HttpError from '../../../support/utils/HttpError';
import { checkHttpError } from '../../../support/utils/utilities';

describe('environment terminate negative tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeEach(() => {
    console.log('beforeEach');
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
      console.log('env does not exist');
      const projectId = setup.getSettings().get('projectId');
      console.log('projectId', projectId);
      await adminSession.resources.environments.environment('fakeEnv').delete();
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
