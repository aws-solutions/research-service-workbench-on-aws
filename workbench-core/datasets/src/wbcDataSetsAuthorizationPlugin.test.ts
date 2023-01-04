/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('@aws/workbench-core-audit');
jest.mock('@aws/workbench-core-authorization');
jest.mock('@aws/workbench-core-logging');
jest.mock('./dataSetMetadataPlugin');

import { AuditService, BaseAuditPlugin, Writer } from '@aws/workbench-core-audit';
import {
  DDBDynamicAuthorizationPermissionsPlugin,
  DynamicAuthorizationService,
  WBCGroupManagementPlugin
} from '@aws/workbench-core-authorization';
import { AwsService, DynamoDBService } from '@aws/workbench-core-base';
import { CognitoUserManagementPlugin, UserManagementService } from '@aws/workbench-core-user-management';
import { AddRemoveAccessPermissionRequest } from './models/addRemoveAccessPermissionRequest';
import { GetAccessPermissionRequest } from './models/getAccessPermissionRequest';
import { WbcDataSetsAuthorizationPlugin } from './wbcDataSetsAuthorizationPlugin';

describe('wbcDataSetsAuthorizationPlugin tests', () => {
  let writer: Writer;
  let audit: AuditService;
  let aws: AwsService;
  let ddbService: DynamoDBService;
  let groupManagementPlugin: WBCGroupManagementPlugin;
  let permissionsPlugin: DDBDynamicAuthorizationPermissionsPlugin;
  let authzService: DynamicAuthorizationService;
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
    jest.resetAllMocks();
    writer = {
      prepare: jest.fn(),
      write: jest.fn()
    };
    audit = new AuditService(new BaseAuditPlugin(writer), true);
    aws = new AwsService({
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      }
    });
    ddbService = new DynamoDBService({ region: 'us-east-1', table: 'fakeTable' });
    groupManagementPlugin = new WBCGroupManagementPlugin({
      userManagementService: new UserManagementService(new CognitoUserManagementPlugin('fakeUserPool', aws)),
      ddbService: ddbService,
      userGroupKeyType: 'GROUP'
    });
    permissionsPlugin = new DDBDynamicAuthorizationPermissionsPlugin({
      dynamoDBService: ddbService
    });
    authzService = new DynamicAuthorizationService({
      groupManagementPlugin: groupManagementPlugin,
      dynamicAuthorizationPermissionsPlugin: permissionsPlugin,
      auditService: audit
    });
    plugin = new WbcDataSetsAuthorizationPlugin(authzService);
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
