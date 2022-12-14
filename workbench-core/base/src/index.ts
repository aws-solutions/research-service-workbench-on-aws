/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AuditLogger from './auditLogger';
import AwsService from './aws/awsService';
import {
  CFNTemplate,
  CFNTemplateParameters,
  CFNTemplateParametersParser
} from './aws/helpers/cloudFormationTemplate';
import { buildDynamoDbKey, buildDynamoDBPkSk, removeDynamoDbKeys } from './aws/helpers/dynamoDB/ddbUtil';
import CognitoTokenService from './cognitoTokenService';
import resourceTypeToKey from './constants/resourceTypeToKey';
import { FilterRequest } from './interfaces/filterRequest';
import PaginatedResponse from './interfaces/paginatedResponse';
import { QueryNumberParamFilterParser, QueryNumberParamFilter } from './interfaces/queryNumberParamFilter';
import { QueryParameterFilter } from './interfaces/queryParameterFilter';
import QueryParams from './interfaces/queryParams';
import { QueryStringParamFilterParser, QueryStringParamFilter } from './interfaces/queryStringParamFilter';
import { SortRequest } from './interfaces/sortRequest';
import QueryParameterFilterSchema from './schemas/queryParameterFilterSchema';
import { MetadataService } from './services/metadataService';
import { IamRoleCloneService } from './utilities/iamRoleCloneService';
import {
  addPaginationToken,
  getPaginationToken,
  DEFAULT_API_PAGE_SIZE,
  MAX_API_PAGE_SIZE
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
  uuidRegExpAsString,
  envTypeIdRegExpString,
  productIdRegExpString,
  provisionArtifactIdRegExpString
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
  productIdRegExpString,
  provisionArtifactIdRegExpString,
  envTypeIdRegExpString,
  CFNTemplateParameters,
  CFNTemplateParametersParser,
  CFNTemplate,
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
  MAX_API_PAGE_SIZE,
  PaginatedResponse,
  MetadataService,
  validateAndParse
};
