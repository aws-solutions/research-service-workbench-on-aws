/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AwsService from './aws/awsService';
import { buildDynamoDbKey, buildDynamoDBPkSk } from './aws/helpers/dynamoDB/ddbUtil';
import { QueryParams } from './aws/helpers/dynamoDB/dynamoDBService';
import CognitoTokenService from './cognitoTokenService';
import resourceTypeToKey from './constants/resourceTypeToKey';
import { IamRoleCloneService } from './utilities/iamRoleCloneService';

export {
  AwsService,
  CognitoTokenService,
  QueryParams,
  IamRoleCloneService,
  buildDynamoDbKey,
  buildDynamoDBPkSk,
  resourceTypeToKey
};
