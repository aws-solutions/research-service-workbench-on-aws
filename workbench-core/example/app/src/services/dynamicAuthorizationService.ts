/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DDBDynamicAuthorizationPermissionsPlugin,
  DynamicAuthorizationPermissionsPlugin,
  DynamicAuthorizationService,
  WBCGroupManagementPlugin
} from '@aws/workbench-core-authorization';
import { authorizationGroupPrefix } from '../configs/constants';
import { auditService } from './auditService';
import { dynamicAuthAws } from './awsService';
import { userManagementService } from './userManagementService';

const wbcGroupManagementPlugin: WBCGroupManagementPlugin = new WBCGroupManagementPlugin({
  userManagementService,
  ddbService: dynamicAuthAws.helpers.ddb,
  userGroupKeyType: authorizationGroupPrefix
});

const ddbDynamicAuthorizationPermissionsPlugin: DynamicAuthorizationPermissionsPlugin =
  new DDBDynamicAuthorizationPermissionsPlugin({
    dynamoDBService: dynamicAuthAws.helpers.ddb
  });

export const dynamicAuthorizationService: DynamicAuthorizationService = new DynamicAuthorizationService({
  groupManagementPlugin: wbcGroupManagementPlugin,
  dynamicAuthorizationPermissionsPlugin: ddbDynamicAuthorizationPermissionsPlugin,
  auditService
});
