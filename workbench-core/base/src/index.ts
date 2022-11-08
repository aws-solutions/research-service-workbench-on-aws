/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AuditLogger from './auditLogger';
import AwsService from './aws/awsService';
import { buildDynamoDbKey, buildDynamoDBPkSk, removeDynamoDbKeys } from './aws/helpers/dynamoDB/ddbUtil';
import CognitoTokenService from './cognitoTokenService';
import QueryParams from './constants/queryParams';
import resourceTypeToKey from './constants/resourceTypeToKey';
import { FilterRequest } from './interfaces/filterRequest';
import { QueryParameterFilter } from './interfaces/queryParameterFilter';
import { SortRequest } from './interfaces/sortRequest';
import QueryParameterFilterSchema from './schemas/queryParameterFilterSchema';
import { IamRoleCloneService } from './utilities/iamRoleCloneService';
import { addPaginationToken, getPaginationToken, DEFAULT_API_PAGE_SIZE } from './utilities/paginationHelper';
import {
  getFilterQueryParams,
  getSortQueryParams,
  validateSingleSortAndFilter
} from './utilities/queryParamsFiltersUtils';
import {
  uuidWithLowercasePrefix,
  uuidWithLowercasePrefixRegExp,
  uuidRegExp,
  uuidRegExpAsString
} from './utilities/textUtil';

export {
  AuditLogger,
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
  QueryParameterFilter,
  validateSingleSortAndFilter,
  getFilterQueryParams,
  getSortQueryParams,
  QueryParameterFilterSchema,
  FilterRequest,
  SortRequest,
  addPaginationToken,
  getPaginationToken,
  DEFAULT_API_PAGE_SIZE
};
