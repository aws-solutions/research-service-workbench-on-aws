import {
  Action,
  Effect,
  IdentityPermission,
  IdentityType,
  DynamicOperation,
  AuthenticatedUser
} from '@aws/workbench-core-authorization';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';

describe('dynamic authorization identity permission integration tests ', () => {
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
        ]
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
        ]
      });
      const { identityPermissions } = response.data;
      await expect(
        adminSession.resources.identityPermissions.create(
          {
            identityPermissions
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
          identities
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
          ]
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
        identities: [{ identityId: groupId, identityType: 'GROUP' }]
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
    let description: string;

    let mockCreateIdentityPermission: IdentityPermission;
    let mockDeleteIdentityPermission: IdentityPermission;
    let identityPermissions: IdentityPermission[];

    let randomTextGenerator;

    beforeAll(async () => {
      randomTextGenerator = new RandomTextGenerator('deleteIdentityPermissions');
      const { data: groupData } = await adminSession.resources.groups.create();
      const { data: secondGroupData } = await adminSession.resources.groups.create();
      groupId = groupData.groupId;
      secondGroupId = secondGroupData.groupId;
      groupType = 'GROUP';
      subjectId = randomTextGenerator.getFakeText('sampleSubjectId');
      subjectType = 'sampleSubjectType';
      effect = 'ALLOW';
      description = 'sampleDescription';
      mockCreateIdentityPermission = {
        identityId: groupId,
        identityType: groupType,
        subjectId,
        subjectType,
        action: 'CREATE',
        effect,
        description
      };
      mockDeleteIdentityPermission = {
        identityId: secondGroupId,
        identityType: groupType,
        subjectId,
        subjectType,
        action: 'DELETE',
        effect,
        description
      };
      const { data: identityPermissionsData } = await adminSession.resources.identityPermissions.create(
        {
          identityPermissions: [mockCreateIdentityPermission, mockDeleteIdentityPermission]
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
  describe('deleteIdentityPermissions', () => {
    let identityPermissions: IdentityPermission[];
    beforeEach(async () => {
      const { data } = await adminSession.resources.groups.create();
      const { groupId } = data;

      const response = await adminSession.resources.identityPermissions.create({
        identities: [
          {
            identityId: groupId,
            identityType: 'GROUP'
          }
        ]
      });

      identityPermissions = response.data.identityPermissions;
    });

    test('delete identity permisions', async () => {
      const { data } = await adminSession.resources.identityPermissions.delete({
        identityPermissions
      });

      expect(data.identityPermissions).toStrictEqual(identityPermissions);
    });

    test('delete identity permissions, exceed over 100 deletions', async () => {
      const exceededIdentityPermissions = Array(101).fill(identityPermissions[0]);
      await expect(
        adminSession.resources.identityPermissions.delete({
          identityPermissions: exceededIdentityPermissions
        })
      ).rejects.toThrow(new HttpError(429, {}));
    });
  });

  describe('isAuthorizedOnSubject', () => {
    let mockDeleteIdentityPermission: IdentityPermission;
    let mockReadIdentityPermission: IdentityPermission;
    let mockWildcardCreateIdentityPermission: IdentityPermission;
    let parentId: string;
    let subjectId: string;
    let subjectType: string;
    let groupId: string;
    let randomTextGenerator: RandomTextGenerator;
    let conditions;
    let mockAuthenticatedUser: AuthenticatedUser;
    let user;
    beforeAll(async () => {
      user = {
        firstName: 'Test',
        lastName: 'User',
        email: `success+is-authorized-on-subject-${uuidv4()}@simulator.amazonses.com`
      };
      randomTextGenerator = new RandomTextGenerator('isAuthorizedOnSubject');
      const { data: userData } = await adminSession.resources.users.create(user);
      const { data: groupData } = await adminSession.resources.groups.create();
      await adminSession.resources.groups.group(groupData.groupId).addUser({ userId: userData.id });
      groupId = groupData.groupId;
      mockAuthenticatedUser = {
        id: userData.id,
        roles: [groupId]
      };
      subjectId = randomTextGenerator.getFakeText('sampleSubjectId');
      subjectType = 'sampleSubjectType';
      parentId = randomTextGenerator.getFakeText('sampleParentId');
      conditions = {
        parentId: { $eq: parentId }
      };
      mockDeleteIdentityPermission = {
        identityId: groupId,
        identityType: 'GROUP',
        subjectId,
        subjectType,
        action: 'DELETE',
        effect: 'ALLOW',
        conditions,
        description: 'sampleDescription'
      };

      //mock permission to READ on subject for a specified field
      mockReadIdentityPermission = {
        identityId: groupId,
        identityType: 'GROUP',
        subjectId,
        subjectType,
        action: 'READ',
        effect: 'ALLOW',
        fields: ['sampleField'],
        conditions,
        description: 'sampleDescription'
      };

      mockWildcardCreateIdentityPermission = {
        identityId: groupId,
        identityType: 'GROUP',
        subjectId: '*',
        subjectType,
        action: 'CREATE',
        effect: 'ALLOW',
        conditions,
        description: 'sampleDescription'
      };

      await adminSession.resources.identityPermissions.create(
        {
          identityPermissions: [
            mockReadIdentityPermission,
            mockDeleteIdentityPermission,
            mockWildcardCreateIdentityPermission
          ]
        },
        false
      );
    });

    test('is authorized on DELETE on subject with correct permissions', async () => {
      const dynamicOperation: DynamicOperation = {
        action: 'DELETE',
        subject: {
          subjectId,
          subjectType,
          parentId
        }
      };
      const response = await adminSession.resources.identityPermissions.isAuthorizedOnSubject({
        dynamicOperation,
        authenticatedUser: mockAuthenticatedUser
      });
      expect(response.status).toBe(204);
    });

    test('is authorized on DELETE on subject with incorrect permissions should throw 403', async () => {
      //remove parent id should cause an error
      const dynamicOperation: DynamicOperation = {
        action: 'DELETE',
        subject: {
          subjectId,
          subjectType
        }
      };
      await expect(
        adminSession.resources.identityPermissions.isAuthorizedOnSubject({
          dynamicOperation,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrowError(new HttpError(403, {}));
    });

    test('is authorized on READ on subject with correct permissions', async () => {
      //READ sampleField on subject
      const dynamicOperation: DynamicOperation = {
        action: 'READ',
        subject: {
          subjectId,
          subjectType,
          parentId
        },
        field: 'sampleField'
      };
      const response = await adminSession.resources.identityPermissions.isAuthorizedOnSubject({
        dynamicOperation,
        authenticatedUser: mockAuthenticatedUser
      });
      expect(response.status).toBe(204);
    });

    test('is authorized on READ on subject with incorrect permissions should throw 403', async () => {
      //READ differentField on subject, user is not authorized to do so
      const dynamicOperation: DynamicOperation = {
        action: 'READ',
        subject: {
          subjectId,
          subjectType,
          parentId
        },
        field: 'differentField'
      };
      await expect(
        adminSession.resources.identityPermissions.isAuthorizedOnSubject({
          dynamicOperation,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrowError(new HttpError(403, {}));
    });
    test('is authorized on DELETE on subject with incorrect permissions should throw 403', async () => {
      //different parent id should cause an error
      const dynamicOperation: DynamicOperation = {
        action: 'DELETE',
        subject: {
          subjectId,
          subjectType,
          parentId: 'differentParentId'
        }
      };
      await expect(
        adminSession.resources.identityPermissions.isAuthorizedOnSubject({
          dynamicOperation,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrowError(new HttpError(403, {}));
    });

    test('is authorized on CREATE on subject with correct permissions', async () => {
      //Can create any subject with the specified subjectType as long as it is under the parentId
      const dynamicOperation: DynamicOperation = {
        action: 'CREATE',
        subject: {
          subjectId: randomTextGenerator.getFakeText('sampleSubjectId'),
          subjectType,
          parentId
        }
      };
      const response = await adminSession.resources.identityPermissions.isAuthorizedOnSubject({
        dynamicOperation,
        authenticatedUser: mockAuthenticatedUser
      });
      expect(response.status).toBe(204);
    });

    test('is authorized on CREATE on subject with incorrect permissions should throw 403 ', async () => {
      //Can not create any subject with the specified subjectType without the correct parentId
      const dynamicOperation: DynamicOperation = {
        action: 'CREATE',
        subject: {
          subjectId: randomTextGenerator.getFakeText('sampleSubjectId'),
          subjectType
        }
      };
      await expect(
        adminSession.resources.identityPermissions.isAuthorizedOnSubject({
          dynamicOperation,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrowError(new HttpError(403, {}));
    });
  });
});
