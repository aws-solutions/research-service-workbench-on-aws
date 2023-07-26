/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CognitoUserManagementPlugin, UserManagementService } from '@aws/workbench-core-user-management';
import { aws, dynamicAuthAws } from './awsService';

export const cognitoUserManagementPlugin: CognitoUserManagementPlugin = new CognitoUserManagementPlugin(
  process.env.USER_POOL_ID!,
  aws,
  {
    ddbService: dynamicAuthAws.helpers.ddb
  }
);

export const userManagementService: UserManagementService = new UserManagementService(
  cognitoUserManagementPlugin
);
