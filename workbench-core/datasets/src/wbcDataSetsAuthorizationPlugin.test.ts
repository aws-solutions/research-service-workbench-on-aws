import { AddRemoveAccessPermissionRequest } from './models/addRemoveAccessPermissionRequest';
import { GetAccessPermissionRequest } from './models/getAccessPermissionRequest';
import { WbcDataSetsAuthorizationPlugin } from './wbcDataSetsAuthorizationPlugin';

describe('wbcDataSetsAuthorizationPlugin tests', () => {
  let plugin: WbcDataSetsAuthorizationPlugin;

  const dataSetId: string = 'fake-dataset-id';
  const subject: string = 'fake-group-id';

  const accessPermission: AddRemoveAccessPermissionRequest = {
    dataSetId: dataSetId,
    permission: {
      subject: subject,
      accessLevel: 'read-only'
    }
  };

  const getAccessPermission: GetAccessPermissionRequest = {
    dataSetId: dataSetId,
    subject: subject
  };

  beforeAll(() => {
    const mockAuthService = {
      init: jest.fn(),
      isAuthorizedOnRoute: jest.fn(),
      isAuthorizedOnSubject: jest.fn(),
      isRouteIgnored: jest.fn(),
      isRouteProtected: jest.fn(),
      createGroup: jest.fn(),
      deleteGroup: jest.fn(),
      createIdentityPermissions: jest.fn(),
      deleteIdentityPermissions: jest.fn(),
      getIdentityPermissionsBySubject: jest.fn(),
      removeUserFromGroup: jest.fn(),
      addUserToGroup: jest.fn(),
      getUserGroups: jest.fn(),
      getGroupUsers: jest.fn(),
      isUserAssignedToGroup: jest.fn(),
      doesGroupExist: jest.fn(),
      _groupManagementPlugin: jest.fn()
    };

    //@ts-ignore
    plugin = new WbcDataSetsAuthorizationPlugin(mockAuthService);
  });

  beforeEach(() => {
    expect.hasAssertions();
  });

  describe('addAccessPermission tests', () => {
    it('throws a notimplemented exception', async () => {
      await expect(plugin.addAccessPermission(accessPermission)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('getAccessPermissions tests', () => {
    it('throws a notimplemented exception', async () => {
      await expect(plugin.getAccessPermissions(getAccessPermission)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('removeAccessPermission tests', () => {
    it('throws a notimplemented exception', async () => {
      await expect(plugin.removeAccessPermissions(accessPermission)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('getAllDataSetAccessPermissions tests', () => {
    it('throws a notimplemented exception', async () => {
      await expect(plugin.getAllDataSetAccessPermissions(dataSetId)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('removeAllAccessPermissions tests', () => {
    it('throws a notimplemented exception', async () => {
      await expect(plugin.removeAllAccessPermissions(dataSetId)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });
});
