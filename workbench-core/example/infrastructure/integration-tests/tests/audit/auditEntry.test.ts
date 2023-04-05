import { IdentityPermission } from '@aws/workbench-core-authorization';
import { fc, itProp } from 'jest-fast-check';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('Audit service integration tests', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let newAdminSession: ClientSession;
  let body: object;
  let statusCode: number;
  let action: string;

  beforeEach(async () => {
    expect.hasAssertions();
    body = {
      sampleBody: {
        sampleKey: 'sampleValue'
      }
    };
  });

  beforeAll(async () => {
    statusCode = 200;
    action = 'sampleAction';
    adminSession = await setup.getDefaultAdminSession();
    const { data } = await adminSession.resources.groups.create();
    const groupId = data.groupId;
    const auditPermissionsRequired: IdentityPermission[] = [
      {
        action: 'CREATE',
        effect: 'ALLOW',
        identityId: groupId,
        identityType: 'GROUP',
        subjectId: '*',
        subjectType: 'auditEntry'
      },
      {
        action: 'READ',
        effect: 'ALLOW',
        identityId: groupId,
        identityType: 'GROUP',
        subjectId: '*',
        subjectType: 'auditEntry'
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

  test('write completed audit entry', async () => {
    const auditEntry = {
      statusCode,
      action,
      responseBody: body
    };

    const response = await newAdminSession.resources.auditEntry.writeAuditEntry(auditEntry);
    expect(response.status).toBe(200);
  });

  test('write incomplete audit entry, should throw 400 error', async () => {
    const auditEntry = {
      statusCode,
      responseBody: body
    };
    await expect(newAdminSession.resources.auditEntry.writeAuditEntry(auditEntry)).rejects.toThrowError(
      new HttpError(400, {})
    );
  });

  test('incompelete audit entry should return false', async () => {
    const auditEntry = {
      statusCode,
      responseBody: body
    };
    const response = await newAdminSession.resources.auditEntry.isAuditEntryComplete(auditEntry);
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual({
      isComplete: false
    });
  });

  test('completed audit entry should return true', async () => {
    const auditEntry = {
      statusCode,
      action,
      responseBody: body
    };
    const response = await newAdminSession.resources.auditEntry.isAuditEntryComplete(auditEntry);
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual({
      isComplete: true
    });
  });

  itProp(
    'test randomized object on isAuditEntryComplete, return false',
    [fc.object()],
    async (randomObject) => {
      const response = await newAdminSession.resources.auditEntry.isAuditEntryComplete(randomObject);
      expect(response.status).toBe(200);
      expect(response.data).toStrictEqual({
        isComplete: false
      });
    }
  );

  itProp(
    'test randomized object on write audit entry, throws 400',
    [fc.object()],
    async (randomizedObject) => {
      await expect(
        newAdminSession.resources.auditEntry.writeAuditEntry(randomizedObject)
      ).rejects.toThrowError(new HttpError(400, {}));
    }
  );
});
