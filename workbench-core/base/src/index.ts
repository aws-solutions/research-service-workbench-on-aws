/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AwsService from './aws/awsService';
import {
  CFNTemplate,
  CFNTemplateParameters,
  CFNTemplateParametersParser
} from './aws/helpers/cloudFormationTemplate';
import {
  buildConcatenatedSk,
  buildDynamoDbKey,
  buildDynamoDBPkSk,
  removeDynamoDbKeys
} from './aws/helpers/dynamoDB/ddbUtil';
import DynamoDBService from './aws/helpers/dynamoDB/dynamoDBService';
import CognitoTokenService from './cognitoTokenService';
import resourceTypeToKey from './constants/resourceTypeToKey';
import { isInvalidPaginationTokenError } from './errors/invalidPaginationTokenError';
import { FilterRequest } from './interfaces/filterRequest';
import { ListUsersForRoleRequest, ListUsersForRoleRequestParser } from './interfaces/listUsersForRoleRequest';
import PaginatedResponse from './interfaces/paginatedResponse';
import { QueryNumberParamFilterParser, QueryNumberParamFilter } from './interfaces/queryNumberParamFilter';
import { QueryParameterFilter } from './interfaces/queryParameterFilter';
import QueryParams from './interfaces/queryParams';
import { QueryStringParamFilterParser, QueryStringParamFilter } from './interfaces/queryStringParamFilter';
import { SortRequest } from './interfaces/sortRequest';
import QueryParameterFilterSchema from './schemas/queryParameterFilterSchema';
import { MetadataService } from './services/metadataService';
import { SecretsService } from './services/secretsService';
import JSONValue from './types/json';
import { RelationshipDDBItem, RelationshipDDBItemParser } from './types/relationshipDDBItem';
import { IamRoleCloneService } from './utilities/iamRoleCloneService';
import {
  addPaginationToken,
  getPaginationToken,
  DEFAULT_API_PAGE_SIZE,
  MAX_API_PAGE_SIZE,
  toPaginationToken,
  fromPaginationToken
} from './utilities/paginationHelper';
import { runInBatches } from './utilities/promiseUtils';
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
  provisionArtifactIdRegExpString,
  groupIDRegExpAsString,
  validRolesRegExpAsString,
  validSshKeyUuidRegExpAsString,
  swbNameMaxLength,
  nonEmptyMessage,
  invalidIdMessage,
  invalidEmailMessage,
  requiredMessage,
  urlFilterMaxLength,
  swbDescriptionMessage,
  swbNameMessage,
  nonHTMLMessage,
  swbDescriptionMaxLength,
  lengthValidationMessage,
  betweenFilterMessage
} from './utilities/textUtil';
import { getPaginationParser, validateAndParse, z } from './utilities/validatorHelper';

export {
  AwsService,
  CognitoTokenService,
  QueryParams,
  IamRoleCloneService,
  buildConcatenatedSk,
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
  groupIDRegExpAsString,
  CFNTemplateParameters,
  CFNTemplateParametersParser,
  CFNTemplate,
  QueryStringParamFilter,
  QueryStringParamFilterParser,
  QueryNumberParamFilter,
  QueryNumberParamFilterParser,
  validRolesRegExpAsString,
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
  validateAndParse,
  JSONValue,
  DynamoDBService,
  SecretsService,
  RelationshipDDBItemParser,
  RelationshipDDBItem,
  toPaginationToken,
  fromPaginationToken,
  runInBatches,
  validSshKeyUuidRegExpAsString,
  getPaginationParser,
  z,
  swbNameMaxLength,
  nonEmptyMessage,
  invalidIdMessage,
  invalidEmailMessage,
  requiredMessage,
  urlFilterMaxLength,
  swbDescriptionMessage,
  swbNameMessage,
  nonHTMLMessage,
  swbDescriptionMaxLength,
  lengthValidationMessage,
  betweenFilterMessage,
  isInvalidPaginationTokenError,
  ListUsersForRoleRequestParser,
  ListUsersForRoleRequest
};
