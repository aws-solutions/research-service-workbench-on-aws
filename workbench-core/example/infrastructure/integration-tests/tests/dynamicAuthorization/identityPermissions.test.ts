import {
  Action,
  AuthenticatedUser,
  Effect,
  IdentityPermission,
  IdentityType
} from '@aws/workbench-core-authorization';
import { JSONValue } from '@aws/workbench-core-base';
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

  describe('getIdentityPermissionsByIdentity', () => {
    let groupId: string;
    beforeEach(async () => {
      const { data } = await adminSession.resources.groups.create();
      groupId = data.groupId;
    });
    test('get identity permissions by identity', async () => {
      const { data } = await adminSession.resources.identityPermissions.create({
        identities: [{ identityId: groupId, identityType: 'GROUP' }],
        authenticatedUser: mockUser
      });
      const { identityPermissions } = data;
      const response = await adminSession.resources.identityPermissions.getByIdentity({
        identityId: groupId,
        identityType: 'GROUP'
      });
      expect(response.data.identityPermissions).toStrictEqual(identityPermissions);
    });
    test('get identity permissions by identity with no permission', async () => {
      const response = await adminSession.resources.identityPermissions.getByIdentity({
        identityId: groupId,
        identityType: 'GROUP'
      });
      expect(response.data.identityPermissions).toStrictEqual([]);
    });
  });
  describe('getIdentityPermissionsBySubject', () => {
    let groupId: string;
    let secondGroupId: string;
    let groupType: IdentityType;
    let subjectId: string;
    let subjectType: string;
    let effect: Effect;
    let conditions: Record<string, JSONValue>;
    let fields: string[];
    let description: string;

    let mockCreateIdentityPermission: IdentityPermission;
    let mockDeleteIdentityPermission: IdentityPermission;
    let identityPermissions: IdentityPermission[];

    beforeAll(async () => {
      const { data: groupData } = await adminSession.resources.groups.create();
      const { data: secondGroupData } = await adminSession.resources.groups.create();
      groupId = groupData.groupId;
      secondGroupId = secondGroupData.groupId;
      groupType = 'GROUP';
      subjectId = 'sampleSubjectId';
      subjectType = 'sampleSubjectType';
      effect = 'ALLOW';
      conditions = {};
      fields = [];
      description = 'sampleDescription';
      mockCreateIdentityPermission = {
        identityId: groupId,
        identityType: groupType,
        subjectId,
        subjectType,
        action: 'CREATE',
        effect,
        conditions,
        fields,
        description
      };
      mockDeleteIdentityPermission = {
        identityId: secondGroupId,
        identityType: groupType,
        subjectId,
        subjectType,
        action: 'DELETE',
        effect,
        conditions,
        fields,
        description
      };
      const { data: identityPermissionsData } = await adminSession.resources.identityPermissions.create(
        {
          identityPermissions: [mockCreateIdentityPermission, mockDeleteIdentityPermission],
          authenticatedUser: mockUser
        },
        false
      );
      identityPermissions = identityPermissionsData.identityPermissions;
    });

    test('get identity permissions by subject', async () => {
      const { data } = await adminSession.resources.identityPermissions.getBySubject({
        subjectType,
        subjectId
      });
      expect(data.identityPermissions).toStrictEqual(identityPermissions);
    });

    test('get identity permissions by subject, filter on action', async () => {
      const action: Action = 'DELETE';
      const { data } = await adminSession.resources.identityPermissions.getBySubject({
        subjectType,
        subjectId,
        action
      });
      expect(data.identityPermissions).toStrictEqual([mockDeleteIdentityPermission]);
    });

    test('get identity permissions by subject, filter on groupId', async () => {
      const identities = [{ identityId: groupId, identityType: groupType }];
      const { data } = await adminSession.resources.identityPermissions.getBySubject({
        subjectType,
        subjectId,
        identities
      });
      expect(data.identityPermissions).toStrictEqual([mockCreateIdentityPermission]);
    });

    test('get identity permissions by subject, filter on groupId and action, no permissions returned', async () => {
      const identities = [{ identityId: groupId, identityType: groupType }];
      const action: Action = 'DELETE';
      const { data } = await adminSession.resources.identityPermissions.getBySubject({
        subjectType,
        subjectId,
        identities,
        action
      });
      expect(data.identityPermissions).toStrictEqual([]);
    });

    test('get identity permissions by subject, filter on groupIds exceeds 100 should return a 429', async () => {
      const identities = Array(101).fill({ identityId: '1', identityType: groupType });
      await expect(
        adminSession.resources.identityPermissions.getBySubject({
          subjectType,
          subjectId,
          identities
        })
      ).rejects.toThrow(new HttpError(429, {}));
    });
  });
});
