import { IdentityPermission } from '@aws/workbench-core-authorization';
import { fc, testProp } from 'jest-fast-check';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('Static authorization integration tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let newAdminSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    const { data } = await adminSession.resources.groups.create();
    const groupId = data.groupId;
    const auditPermissionsRequired: IdentityPermission[] = [
      {
        action: 'READ',
        effect: 'ALLOW',
        identityId: groupId,
        identityType: 'GROUP',
        subjectId: '*',
        subjectType: 'staticRouteConfig'
      },
      {
        action: 'READ',
        effect: 'ALLOW',
        identityId: groupId,
        identityType: 'GROUP',
        subjectId: '*',
        subjectType: 'staticRouteIgnored'
      }
    ];
    await adminSession.resources.identityPermissions.create(
      {
        identityPermissions: auditPermissionsRequired
      },
      false
    );
    await adminSession.resources.groups
      .group(groupId)
      .addUser({ userId: adminSession.getSettings().get('rootUserId') });
    newAdminSession = await setup.createAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('isAuthorizedOnRoute', () => {
    test('test an authorized valid route should return a 200', async () => {
      const route = '/staticSampleRoute';
      const method = 'GET';

      const response = await newAdminSession.resources.staticAuthorization.isAuthorizedOnRoute({
        route,
        method
      });
      expect(response.status).toBe(200);
    });

    test('test an unauthorized valid route should return a 403', async () => {
      const route = '/staticSampleRoute';
      const method = 'POST';

      await expect(
        newAdminSession.resources.staticAuthorization.isAuthorizedOnRoute({
          route,
          method
        })
      ).rejects.toThrow(new HttpError(403, {}));
    });
    test('test an authorized valid param based route should return a 200', async () => {
      const route = '/staticSampleRoute/sampleParam';
      const method = 'GET';

      const response = await newAdminSession.resources.staticAuthorization.isAuthorizedOnRoute({
        route,
        method
      });
      expect(response.status).toBe(200);
    });

    test('test an unauthorized valid param based route should return a 403', async () => {
      const route = '/staticSampleRoute/sampleParam';
      const method = 'POST';

      await expect(
        newAdminSession.resources.staticAuthorization.isAuthorizedOnRoute({
          route,
          method
        })
      ).rejects.toThrow(new HttpError(403, {}));
    });
    test('test an unauthorized invalid param based route should return a 403', async () => {
      const route = '/invalidRoute/sampleParam';
      const method = 'POST';

      await expect(
        newAdminSession.resources.staticAuthorization.isAuthorizedOnRoute({
          route,
          method
        })
      ).rejects.toThrow(new HttpError(403, {}));
    });
    test('test an unauthorized route that explicitly has DENY permissions for user should return 403', async () => {
      const route = '/staticSampleRoute';
      const method = 'PUT';

      await expect(
        newAdminSession.resources.staticAuthorization.isAuthorizedOnRoute({
          route,
          method
        })
      ).rejects.toThrow(new HttpError(403, {}));
    });

    test('test an unauthorized route that explicitly has DENY and ALLOW permissions for user should return 403', async () => {
      const route = '/staticSampleRoute';
      const method = 'DELETE';

      await expect(
        newAdminSession.resources.staticAuthorization.isAuthorizedOnRoute({
          route,
          method
        })
      ).rejects.toThrow(new HttpError(403, {}));
    });

    testProp('random object should return a 400', [fc.object()], async (randomObject) => {
      await expect(
        newAdminSession.resources.staticAuthorization.isAuthorizedOnRoute(randomObject)
      ).rejects.toThrow(new HttpError(400, {}));
    });
  });

  describe('isRouteIgnored', () => {
    test('test a valid ignored route should return true', async () => {
      const route = '/sampleStaticIgnoreRoute';
      const method = 'POST';

      const { data, status } = await newAdminSession.resources.staticAuthorization.isRouteIgnored({
        route,
        method
      });
      expect(status).toBe(200);
      expect(data).toStrictEqual({
        ignored: true
      });
    });
    test('test an invalid ingored route should return false', async () => {
      const route = '/sampleStaticIgnoreRoute';
      const method = 'GET';

      const { data, status } = await newAdminSession.resources.staticAuthorization.isRouteIgnored({
        route,
        method
      });
      expect(status).toBe(200);
      expect(data).toStrictEqual({
        ignored: false
      });
    });
    testProp('randomized object should return 400', [fc.object()], async (randomObject) => {
      await expect(
        newAdminSession.resources.staticAuthorization.isRouteIgnored(randomObject)
      ).rejects.toThrow(new HttpError(400, {}));
    });
  });
});
