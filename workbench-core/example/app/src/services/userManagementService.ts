/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CognitoUserManagementPlugin, UserManagementService } from '@aws/workbench-core-user-management';
import { aws } from './awsService';

export const userManagementService: UserManagementService = new UserManagementService(
  new CognitoUserManagementPlugin(process.env.USER_POOL_ID!, aws)
);
