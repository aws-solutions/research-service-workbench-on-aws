import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';

describe('dynamic authorization routes protection integration tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });
  describe('isRouteProtected', () => {
    test('GET on /helloworld route should be protected', async () => {
      const { data } = await adminSession.resources.routesProtection.isRouteProtected({
        route: '/helloworld',
        method: 'GET'
      });
      expect(data.routeProtected).toBeTruthy();
    });

    test('DELETE on /helloworld route should not be protected', async () => {
      const { data } = await adminSession.resources.routesProtection.isRouteProtected({
        route: '/helloworld',
        method: 'DELETE'
      });
      expect(data.routeProtected).toBeFalsy();
    });
  });

  describe('isRouteIgnored', () => {
    test('GET on /login route should be ignored', async () => {
      const { data } = await adminSession.resources.routesProtection.isRouteIgnored({
        route: '/login',
        method: 'GET'
      });
      expect(data.routeIgnored).toBeTruthy();
    });

    test('DELETE on /login route should be not ignored', async () => {
      const { data } = await adminSession.resources.routesProtection.isRouteIgnored({
        route: '/login',
        method: 'DELETE'
      });
      expect(data.routeIgnored).toBeFalsy();
    });
  });
});
