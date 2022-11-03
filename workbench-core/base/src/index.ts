/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AwsService from './aws/awsService';
import { buildDynamoDbKey, buildDynamoDBPkSk, removeDynamoDbKeys } from './aws/helpers/dynamoDB/ddbUtil';
import CognitoTokenService from './cognitoTokenService';
import QueryParams from './constants/queryParams';
import resourceTypeToKey from './constants/resourceTypeToKey';
import { IamRoleCloneService } from './utilities/iamRoleCloneService';
import { addPaginationToken, getPaginationToken, DEFAULT_API_PAGE_SIZE } from './utilities/paginationHelper';
import {
  uuidWithLowercasePrefix,
  uuidWithLowercasePrefixRegExp,
  uuidRegExp,
  uuidRegExpAsString
} from './utilities/textUtil';

export {
  AwsService,
  CognitoTokenService,
  QueryParams,
  IamRoleCloneService,
  buildDynamoDbKey,
  buildDynamoDBPkSk,
  removeDynamoDbKeys,
  resourceTypeToKey,
  uuidWithLowercasePrefix,
  uuidRegExp,
  uuidWithLowercasePrefixRegExp,
  uuidRegExpAsString,
  addPaginationToken,
  getPaginationToken,
  DEFAULT_API_PAGE_SIZE
};
