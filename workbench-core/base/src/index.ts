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
import PaginatedResponse from './interfaces/paginatedResponse';
import { QueryNumberParamFilterParser, QueryNumberParamFilter } from './interfaces/queryNumberParamFilter';
import { QueryParameterFilter } from './interfaces/queryParameterFilter';
import { QueryStringParamFilterParser, QueryStringParamFilter } from './interfaces/queryStringParamFilter';
import { SortRequest } from './interfaces/sortRequest';
import QueryParameterFilterSchema from './schemas/queryParameterFilterSchema';
import { MetadataService } from './services/metadataService';
import { IamRoleCloneService } from './utilities/iamRoleCloneService';
import {
  addPaginationToken,
  getPaginationToken,
  DEFAULT_API_PAGE_SIZE,
  toPaginationToken,
  fromPaginationToken
} from './utilities/paginationHelper';
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
  QueryStringParamFilter,
  QueryStringParamFilterParser,
  QueryNumberParamFilter,
  QueryNumberParamFilterParser,
  QueryParameterFilter,
  validateSingleSortAndFilter,
  getFilterQueryParams,
  getSortQueryParams,
  QueryParameterFilterSchema,
  FilterRequest,
  SortRequest,
  addPaginationToken,
  getPaginationToken,
  DEFAULT_API_PAGE_SIZE,
  PaginatedResponse,
  MetadataService,
  toPaginationToken,
  fromPaginationToken
};
