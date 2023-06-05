/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProjectStatus } from './accounts/constants/projectStatus';
import AccountHandler from './accounts/handlers/accountHandler';
import { Account } from './accounts/models/accounts/account';
import { CreateAccountRequest } from './accounts/models/accounts/createAccountRequest';
import { CreateProjectRequest } from './accounts/models/projects/createProjectRequest';
import { DeleteProjectRequest } from './accounts/models/projects/deleteProjectRequest';
import { GetProjectRequest } from './accounts/models/projects/getProjectRequest';
import { GetProjectsRequest } from './accounts/models/projects/getProjectsRequest';
import { ListProjectsRequest } from './accounts/models/projects/listProjectsRequest';
import { Project as AccountsProject } from './accounts/models/projects/project';
import { UpdateProjectRequest } from './accounts/models/projects/updateProjectRequest';
import AccountService from './accounts/services/accountService';
import CostCenterService from './accounts/services/costCenterService';
import HostingAccountService from './accounts/services/hostingAccountService';
import ProjectService from './accounts/services/projectService';
import HostingAccountLifecycleService from './accounts/utilities/hostingAccountLifecycleService';
import { ApiRouteConfig, ApiRoute, HTTPMethod } from './apiRouteConfig';
import AuditService from './audit/auditService';
import AuditLogger from './audit/plugins/auditLogger';
import BaseAuditPlugin from './audit/plugins/baseAuditPlugin';
import AuthorizationPlugin from './authorization/authorizationPlugin';
import CASLAuthorizationPlugin from './authorization/caslAuthorizationPlugin';
import { DDBDynamicAuthorizationPermissionsPlugin } from './authorization/dynamicAuthorization/ddbDynamicAuthorizationPermissionsPlugin';
import { DynamicAuthorizationPermissionsPlugin } from './authorization/dynamicAuthorization/dynamicAuthorizationPermissionsPlugin';
import { DynamicAuthorizationService } from './authorization/dynamicAuthorization/dynamicAuthorizationService';
import { GroupManagementPlugin } from './authorization/dynamicAuthorization/groupManagementPlugin';
import {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsRequestParser,
  CreateIdentityPermissionsResponse
} from './authorization/dynamicAuthorization/models/createIdentityPermissions';
import { DeleteGroupRequest } from './authorization/dynamicAuthorization/models/deleteGroup';
import {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsRequestParser,
  DeleteIdentityPermissionsResponse
} from './authorization/dynamicAuthorization/models/deleteIdentityPermissions';
import { GetIdentityPermissionsBySubjectResponse } from './authorization/dynamicAuthorization/models/getIdentityPermissionsBySubject';
import {
  IdentityPermission,
  IdentityPermissionParser,
  IdentityType
} from './authorization/dynamicAuthorization/models/identityPermission';
import { WBCGroupManagementPlugin } from './authorization/dynamicAuthorization/wbcGroupManagementPlugin';
import { ForbiddenError } from './authorization/errors/forbiddenError';
import {
  GroupAlreadyExistsError,
  isGroupAlreadyExistsError
} from './authorization/errors/groupAlreadyExistsError';
import { GroupNotFoundError } from './authorization/errors/groupNotFoundError';
import {
  IdentityPermissionCreationError,
  isIdentityPermissionCreationError
} from './authorization/errors/identityPermissionCreationError';
import { Action } from './authorization/models/action';
import { AuthenticatedUser } from './authorization/models/authenticatedUser';
import { Effect } from './authorization/models/effect';
import { DynamicRoutesMap, RoutesIgnored } from './authorization/models/routesMap';
import AwsService from './base/aws/awsService';
import {
  CFNTemplate,
  CFNTemplateParameters,
  CFNTemplateParametersParser
} from './base/aws/helpers/cloudFormationTemplate';
import { buildDynamoDbKey, buildDynamoDBPkSk, removeDynamoDbKeys } from './base/aws/helpers/dynamoDB/ddbUtil';
import DynamoDBService from './base/aws/helpers/dynamoDB/dynamoDBService';
import CognitoTokenService from './base/cognitoTokenService';
import resourceTypeToKey from './base/constants/resourceTypeToKey';
import { isInvalidPaginationTokenError } from './base/errors/invalidPaginationTokenError';
import { FilterRequest } from './base/interfaces/filterRequest';
import PaginatedResponse from './base/interfaces/paginatedResponse';
import {
  QueryNumberParamFilterParser,
  QueryNumberParamFilter
} from './base/interfaces/queryNumberParamFilter';
import { QueryParameterFilter } from './base/interfaces/queryParameterFilter';
import QueryParams from './base/interfaces/queryParams';
import {
  QueryStringParamFilterParser,
  QueryStringParamFilter
} from './base/interfaces/queryStringParamFilter';
import { SortRequest } from './base/interfaces/sortRequest';
import QueryParameterFilterSchema from './base/schemas/queryParameterFilterSchema';
import { MetadataService } from './base/services/metadataService';
import { SecretsService } from './base/services/secretsService';
import JSONValue from './base/types/json';
import { RelationshipDDBItem, RelationshipDDBItemParser } from './base/types/relationshipDDBItem';
import { IamRoleCloneService } from './base/utilities/iamRoleCloneService';
import {
  addPaginationToken,
  getPaginationToken,
  DEFAULT_API_PAGE_SIZE,
  MAX_API_PAGE_SIZE,
  toPaginationToken,
  fromPaginationToken
} from './base/utilities/paginationHelper';
import { runInBatches } from './base/utilities/promiseUtils';
import {
  getFilterQueryParams,
  getSortQueryParams,
  validateSingleSortAndFilter
} from './base/utilities/queryParamsFiltersUtils';
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
} from './base/utilities/textUtil';
import { getPaginationParser, validateAndParse, z } from './base/utilities/validatorHelper';
import { AddRemoveAccessPermissionRequest } from './dataSets/addRemoveAccessPermissionRequest';
import { CreateProvisionDatasetRequest } from './dataSets/createProvisionDatasetRequest';
import { DataSet } from './dataSets/dataSet';
import {
  DataSetAddExternalEndpointResponse,
  DataSetAddExternalEndpointResponseParser
} from './dataSets/dataSetAddExternalEndpointResponseParser';
import { DataSetExternalEndpointRequest } from './dataSets/dataSetExternalEndpointRequest';
import { DataSetPlugin } from './dataSets/dataSetPlugin';
import { IamHelper } from './dataSets/datasetService/awsUtilities/iamHelper';
import { DataSetsAuthorizationPlugin } from './dataSets/datasetService/dataSetsAuthorizationPlugin';
import { DataSetService } from './dataSets/datasetService/dataSetService';
import { DdbDataSetMetadataPlugin } from './dataSets/datasetService/ddbDataSetMetadataPlugin';
import { AddRemoveAccessPermissionRequest as DatasetServiceAddRemoveAccessPermissionRequest } from './dataSets/datasetService/models/addRemoveAccessPermissionRequest';
import { CreateProvisionDatasetRequest as DatasetServiceCreateProvisionDatasetRequest } from './dataSets/datasetService/models/createProvisionDatasetRequest';
import { DataSetParser } from './dataSets/datasetService/models/dataSet';
import { S3DataSetStoragePlugin } from './dataSets/datasetService/s3DataSetStoragePlugin';
import { WbcDataSetsAuthorizationPlugin } from './dataSets/datasetService/wbcDataSetsAuthorizationPlugin';
import { DataSetStoragePlugin } from './dataSets/dataSetStoragePlugin';
import { GetAccessPermissionRequest } from './dataSets/getAccessPermissionRequestParser';
import { PermissionsResponse, PermissionsResponseParser } from './dataSets/permissionsResponseParser';
import { EnvironmentStatus } from './environments/constants/environmentStatus';
import { Environment } from './environments/environment';
import { EnvironmentItem } from './environments/environmentItem';
import { EnvironmentPlugin } from './environments/environmentPlugin';
import StatusHandler from './environments/handlers/statusHandler';
import { ListEnvironmentsRequest } from './environments/listEnvironmentsRequest';
import EnvironmentConnectionLinkPlaceholder from './environments/models/environmentConnectionLinkPlaceholder';
import EnvironmentConnectionService from './environments/models/environmentConnectionService';
import EnvironmentLifecycleService from './environments/models/environmentLifecycleService';
import { Environment as WBCEnvironment } from './environments/models/environments/environment';
import { ListEnvironmentsServiceRequestParser } from './environments/models/environments/listEnvironmentsServiceRequest';
import { EnvironmentType } from './environments/models/environmentTypes/environmentType';
import EventBridgeEventToDDB from './environments/models/eventBridgeEventToDDB';
import CognitoSetup from './environments/postDeployment/cognitoSetup';
import EnvironmentTypeSetup from './environments/postDeployment/environmentTypeSetup';
import ServiceCatalogSetup from './environments/postDeployment/serviceCatalogSetup';
import { EnvironmentService } from './environments/services/environmentService';
import EnvironmentTypeConfigService from './environments/services/environmentTypeConfigService';
import EnvironmentTypeService from './environments/services/environmentTypeService';
import EnvironmentLifecycleHelper from './environments/utilities/environmentLifecycleHelper';
import { CreateEnvironmentTypeConfigRequest } from './envTypeConfigs/createEnvironmentTypeConfigRequest';
import { DeleteEnvironmentTypeConfigRequest } from './envTypeConfigs/deleteEnvironmentTypeConfigRequest';
import { EnvironmentTypeConfig } from './envTypeConfigs/environmentTypeConfig';
import { EnvTypeConfigPlugin } from './envTypeConfigs/envTypeConfigPlugin';
import { GetEnvironmentTypeConfigRequest } from './envTypeConfigs/getEnvironmentTypeConfigRequest';
import { ListEnvironmentTypeConfigsRequest } from './envTypeConfigs/listEnvironmentTypeConfigsRequest';
import { UpdateEnvironmentTypeConfigRequest } from './envTypeConfigs/updateEnvironmentTypeConfigsRequest';
import { AwsServiceError } from './errors/awsServiceError';
import { ConflictError } from './errors/conflictError';
import { ConnectionInfoNotDefinedError } from './errors/connectionInfoNotDefinedError';
import { DuplicateKeyError } from './errors/duplicateKeyError';
import { Ec2Error } from './errors/ec2Error';
import { NoInstanceFoundError } from './errors/noInstanceFoundError';
import { NoKeyExistsError } from './errors/noKeyExistsError';
import { NonUniqueKeyError } from './errors/nonUniqueKeyError';
import { ProjectDeletedError } from './errors/projectDeletedError';
import { generateRouter } from './generateRouter';
import { LoggingService } from './logging/loggingService';
import { ProjectEnvPlugin } from './projectEnvs/projectEnvPlugin';
import { AssociateProjectEnvTypeConfigRequest } from './projectEnvTypeConfigs/associateProjectEnvTypeConfigRequest';
import { DisassociateProjectEnvTypeConfigRequest } from './projectEnvTypeConfigs/disassociateProjectEnvTypeConfigRequest';
import {
  GetProjectEnvTypeConfigRequest,
  GetProjectEnvTypeConfigRequestParser
} from './projectEnvTypeConfigs/getProjectEnvTypeConfigRequest';
import {
  ListEnvTypeConfigProjectsRequest,
  ListEnvTypeConfigProjectsRequestParser
} from './projectEnvTypeConfigs/listEnvTypeConfigProjectsRequest';

import {
  ListProjectEnvTypeConfigsRequest,
  ListProjectEnvTypeConfigsRequestParser
} from './projectEnvTypeConfigs/listProjectEnvTypeConfigsRequest';
import { Project } from './projectEnvTypeConfigs/project';
import { ProjectEnvTypeConfigPlugin } from './projectEnvTypeConfigs/projectEnvTypeConfigPlugin';
import { ProjectPlugin } from './projects/projectPlugin';
import { CreateSshKeyRequest } from './sshKeys/createSshKeyRequest';
import { CreateSshKeyResponse } from './sshKeys/createSshKeyResponse';
import { DeleteSshKeyRequest } from './sshKeys/deleteSshKeyRequest';
import { ListUserSshKeysForProjectRequest } from './sshKeys/listUserSshKeysForProjectRequest';
import {
  ListUserSshKeysForProjectResponse,
  ListUserSshKeysForProjectResponseParser
} from './sshKeys/listUserSshKeysForProjectResponse';
import { SendPublicKeyRequest } from './sshKeys/sendPublicKeyRequest';
import { SendPublicKeyResponse, SendPublicKeyResponseParser } from './sshKeys/sendPublicKeyResponse';
import { SshKey, SshKeyParser } from './sshKeys/sshKey';
import { SshKeyPlugin } from './sshKeys/sshKeyPlugin';
import { CognitoUserManagementPlugin } from './userManagement/plugins/cognitoUserManagementPlugin';
import { Status, User, CreateUser } from './userManagement/user';
import { UserManagementService } from './userManagement/userManagementService';

export {
  generateRouter,
  AddRemoveAccessPermissionRequest,
  ApiRouteConfig,
  ApiRoute,
  CreateProvisionDatasetRequest,
  DataSet,
  DataSetAddExternalEndpointResponse,
  DataSetAddExternalEndpointResponseParser,
  DataSetExternalEndpointRequest,
  DataSetPlugin,
  DataSetStoragePlugin,
  GetAccessPermissionRequest,
  HTTPMethod,
  ListProjectEnvTypeConfigsRequest,
  ListProjectEnvTypeConfigsRequestParser,
  PermissionsResponse,
  PermissionsResponseParser,
  ProjectEnvPlugin,
  ProjectEnvTypeConfigPlugin,
  ProjectPlugin,
  CreateSshKeyRequest,
  CreateSshKeyResponse,
  DeleteSshKeyRequest,
  ListUserSshKeysForProjectRequest,
  ListUserSshKeysForProjectResponse,
  ListUserSshKeysForProjectResponseParser,
  SshKey,
  SshKeyParser,
  SshKeyPlugin,
  SendPublicKeyRequest,
  SendPublicKeyResponse,
  NonUniqueKeyError,
  NoKeyExistsError,
  Ec2Error,
  AwsServiceError,
  CreateEnvironmentTypeConfigRequest,
  UpdateEnvironmentTypeConfigRequest,
  DeleteEnvironmentTypeConfigRequest,
  GetEnvironmentTypeConfigRequest,
  ListEnvironmentTypeConfigsRequest,
  EnvironmentTypeConfig,
  EnvTypeConfigPlugin,
  AssociateProjectEnvTypeConfigRequest,
  DisassociateProjectEnvTypeConfigRequest,
  ConflictError,
  GetProjectEnvTypeConfigRequest,
  GetProjectEnvTypeConfigRequestParser,
  ListEnvTypeConfigProjectsRequest,
  ListEnvTypeConfigProjectsRequestParser,
  Project,
  NoInstanceFoundError,
  ConnectionInfoNotDefinedError,
  DuplicateKeyError,
  SendPublicKeyResponseParser,
  ProjectDeletedError,
  EnvironmentPlugin,
  ListEnvironmentsRequest,
  ListEnvironmentsServiceRequestParser,
  Environment,
  EnvironmentItem,
  EnvironmentConnectionLinkPlaceholder,
  EnvironmentConnectionService,
  EnvironmentLifecycleHelper,
  EnvironmentLifecycleService,
  StatusHandler,
  EventBridgeEventToDDB,
  AccountService,
  CostCenterService,
  HostingAccountService,
  AccountsProject,
  ProjectStatus,
  ProjectService,
  HostingAccountLifecycleService,
  BaseAuditPlugin,
  AuditService,
  AuditLogger,
  DynamicAuthorizationService,
  WBCGroupManagementPlugin,
  DDBDynamicAuthorizationPermissionsPlugin,
  CASLAuthorizationPlugin,
  AuthorizationPlugin,
  DynamicAuthorizationPermissionsPlugin,
  GroupManagementPlugin,
  DynamicRoutesMap,
  RoutesIgnored,
  isGroupAlreadyExistsError,
  isIdentityPermissionCreationError,
  GroupNotFoundError,
  GroupAlreadyExistsError,
  IdentityPermissionCreationError,
  ForbiddenError,
  IdentityPermission,
  IdentityPermissionParser,
  IdentityType,
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse,
  CreateIdentityPermissionsRequestParser,
  DeleteGroupRequest,
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse,
  DeleteIdentityPermissionsRequestParser,
  GetIdentityPermissionsBySubjectResponse,
  Effect,
  Action,
  AuthenticatedUser,
  DataSetService,
  DataSetParser,
  DataSetsAuthorizationPlugin,
  DatasetServiceAddRemoveAccessPermissionRequest,
  DatasetServiceCreateProvisionDatasetRequest,
  DdbDataSetMetadataPlugin,
  S3DataSetStoragePlugin,
  WbcDataSetsAuthorizationPlugin,
  EnvironmentService,
  EnvironmentTypeService,
  EnvironmentTypeConfigService,
  WBCEnvironment,
  EnvironmentStatus,
  EnvironmentType,
  LoggingService,
  CognitoUserManagementPlugin,
  UserManagementService,
  User,
  Status,
  CreateUser,
  CreateProjectRequest,
  DeleteProjectRequest,
  GetProjectRequest,
  GetProjectsRequest,
  ListProjectsRequest,
  UpdateProjectRequest,
  AccountHandler,
  CognitoSetup,
  ServiceCatalogSetup,
  EnvironmentTypeSetup,
  IamHelper,
  Account,
  CreateAccountRequest,
  AwsService,
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
  betweenFilterMessage,
  CFNTemplate,
  CFNTemplateParameters,
  CFNTemplateParametersParser,
  addPaginationToken,
  getPaginationToken,
  DEFAULT_API_PAGE_SIZE,
  MAX_API_PAGE_SIZE,
  toPaginationToken,
  fromPaginationToken,
  getPaginationParser,
  validateAndParse,
  z,
  buildDynamoDbKey,
  buildDynamoDBPkSk,
  removeDynamoDbKeys,
  getFilterQueryParams,
  getSortQueryParams,
  validateSingleSortAndFilter,
  DynamoDBService,
  CognitoTokenService,
  runInBatches,
  resourceTypeToKey,
  isInvalidPaginationTokenError,
  FilterRequest,
  PaginatedResponse,
  QueryNumberParamFilterParser,
  QueryNumberParamFilter,
  QueryParameterFilter,
  QueryParams,
  QueryStringParamFilterParser,
  QueryStringParamFilter,
  SortRequest,
  QueryParameterFilterSchema,
  MetadataService,
  SecretsService,
  JSONValue,
  RelationshipDDBItem,
  RelationshipDDBItemParser,
  IamRoleCloneService
};
