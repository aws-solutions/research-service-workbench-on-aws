/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AuditLogger from './auditLogger';
import AwsService from './aws/awsService';
import { CFNTemplate, CFNTemplateParameters } from './aws/helpers/cloudFormationTemplate';
import { buildDynamoDbKey, buildDynamoDBPkSk } from './aws/helpers/dynamoDB/ddbUtil';
import { QueryParams } from './aws/helpers/dynamoDB/dynamoDBService';
import CognitoTokenService from './cognitoTokenService';
import resourceTypeToKey from './constants/resourceTypeToKey';
import { IamRoleCloneService } from './utilities/iamRoleCloneService';
import {
  uuidWithLowercasePrefix,
  uuidWithLowercasePrefixRegExp,
  uuidRegExp,
  uuidRegExpAsString,
  envTypeIdRegExpString,
  productIdRegExpString,
  provisionArtifactIdRegExpString
} from './utilities/textUtil';

export {
  AuditLogger,
  AwsService,
  CognitoTokenService,
  QueryParams,
  IamRoleCloneService,
  buildDynamoDbKey,
  buildDynamoDBPkSk,
  resourceTypeToKey,
  uuidWithLowercasePrefix,
  uuidRegExp,
  uuidWithLowercasePrefixRegExp,
  uuidRegExpAsString,
  productIdRegExpString,
  provisionArtifactIdRegExpString,
  envTypeIdRegExpString,
  CFNTemplateParameters,
  CFNTemplate
};
