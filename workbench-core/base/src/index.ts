/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AuditLogger from './auditLogger';
import AwsService from './aws/awsService';
import { buildDynamoDbKey, buildDynamoDBPkSk, removeDynamoDbKeys } from './aws/helpers/dynamoDB/ddbUtil';
import CognitoTokenService from './cognitoTokenService';
import resourceTypeToKey from './constants/resourceTypeToKey';
import { FilterRequest } from './interfaces/filterRequest';
import PaginatedResponse from './interfaces/paginatedResponse';
import { QueryNumberParamFilterParser, QueryNumberParamFilter } from './interfaces/queryNumberParamFilter';

import QueryParams from './interfaces/queryParams';
import { QueryStringParamFilterParser, QueryStringParamFilter } from './interfaces/queryStringParamFilter';
import { SortRequest } from './interfaces/sortRequest';

import { MetadataService } from './services/metadataService';
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
import { validateAndParse } from './utilities/validatorHelper';

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
  QueryStringParamFilter,
  QueryStringParamFilterParser,
  QueryNumberParamFilter,
  QueryNumberParamFilterParser,
  validateSingleSortAndFilter,
  getFilterQueryParams,
  getSortQueryParams,
  FilterRequest,
  SortRequest,
  addPaginationToken,
  getPaginationToken,
  DEFAULT_API_PAGE_SIZE,
  PaginatedResponse,
  MetadataService,
  validateAndParse
};
