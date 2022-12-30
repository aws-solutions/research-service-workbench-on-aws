import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('dynamic authorization identity permission integration tests ', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let mockUser: AuthenticatedUser;
  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    mockUser = {
      id: 'sampleId',
      roles: []
    };
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('createIdentityPermissions', () => {
    test('Create a group and create a permission for that group', async () => {
      const { data } = await adminSession.resources.groups.create();
      const { groupId } = data;

      const response = await adminSession.resources.identityPermissions.create({
        identities: [
          {
            identityId: groupId,
            identityType: 'GROUP'
          }
        ],
        authenticatedUser: mockUser
      });
      expect(response.data.identityPermissions).toBeDefined();
      expect(response.data.identityPermissions[0].identityId).toBe(groupId);
    });

    test('Return a 400 when trying to create an identity permission that already exists', async () => {
      const { data } = await adminSession.resources.groups.create();
      const { groupId } = data;

      const response = await adminSession.resources.identityPermissions.create({
        identities: [
          {
            identityId: groupId,
            identityType: 'GROUP'
          }
        ],
        authenticatedUser: mockUser
      });
      const { identityPermissions } = response.data;
      await expect(
        adminSession.resources.identityPermissions.create(
          {
            identityPermissions,
            authenticatedUser: mockUser
          },
          false
        )
      ).rejects.toThrow(new HttpError(400, {}));
    });
    test('Return a 429 when trying to create too many identity permissions', async () => {
      const { data } = await adminSession.resources.groups.create();
      const { groupId } = data;
      const identities = Array(101).fill({
        identityId: groupId,
        identityType: 'GROUP'
      });
      await expect(
        adminSession.resources.identityPermissions.create({
          identities,
          authenticatedUser: mockUser
        })
      ).rejects.toThrow(new HttpError(429, {}));
    });
    test('Return a 400 when trying to create an identity permission for an invalid group', async () => {
      const groupId = 'sampleGroupId';

      await expect(
        adminSession.resources.identityPermissions.create({
          identities: [
            {
              identityId: groupId,
              identityType: 'GROUP'
            }
          ],
          authenticatedUser: mockUser
        })
      ).rejects.toThrow(new HttpError(400, {}));
    });
  });
});
