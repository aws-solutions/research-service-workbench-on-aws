import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';

describe('multiple Cognito App Clients', () => {
  const setup: Setup = new Setup();
  let clientSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    clientSession = await setup.getDefaultAdminSession();
  });
});
