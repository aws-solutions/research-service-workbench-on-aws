/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export { DataSetsAuthorizationPlugin } from './dataSetsAuthorizationPlugin';
export { DataSetMetadataPlugin } from './dataSetMetadataPlugin';
export { DataSetService } from './dataSetService';
export { DataSetsStoragePlugin } from './dataSetsStoragePlugin';
export { DdbDataSetMetadataPlugin } from './ddbDataSetMetadataPlugin';
export { S3DataSetStoragePlugin } from './s3DataSetStoragePlugin';
export { WbcDataSetsAuthorizationPlugin } from './wbcDataSetsAuthorizationPlugin';

// errors
export {
  DataSetInvalidParameterError,
  isDataSetInvalidParameterError
} from './errors/dataSetInvalidParameterError';
export { DataSetHasEndpointError, isDataSetHasEndpointError } from './errors/dataSetHasEndpointError';
export { DataSetNotFoundError, isDataSetNotFoundError } from './errors/dataSetNotFoundError';
export { EndpointExistsError, isEndpointExistsError } from './errors/endpointExistsError';
export { RoleExistsOnEndpointError, isRoleExistsOnEndpointError } from './errors/roleExistsOnEndpointError';
export { InvalidIamRoleError, isInvalidIamRoleError } from './errors/invalidIamRoleError';
export { NotAuthorizedError, isNotAuthorizedError } from './errors/notAuthorizedError';
export { InvalidPermissionError, isInvalidPermissionError } from './errors/invalidPermissionError';
export { DataSetExistsError, isDataSetExistsError } from './errors/dataSetExistsError';
export { EndpointNotFoundError, isEndpointNotFoundError } from './errors/endpointNotFoundError';
export { InvalidArnError, isInvalidArnError } from './errors/invalidArnError';
export { InvalidEndpointError, isInvalidEndpointError } from './errors/invalidEndpointError';
export { AccountNotFoundError, isAccountNotFoundError } from './errors/accountNotFoundError';
export { StorageNotFoundError, isStorageNotFoundError } from './errors/storageNotFoundError';

// models
export {
  AddRemoveAccessPermissionRequest,
  AddRemoveAccessPermissionParser
} from './models/addRemoveAccessPermissionRequest';
export { CreateProvisionDatasetRequest } from './models/createProvisionDatasetRequest';
export { DataSet, DataSetParser, DataSetArrayParser, CreateDataSet } from './models/dataSet';
export { DataSetMetadataParser, ExternalEndpointMetadataParser } from './models/ddbMetadata';
export { DataSetMountObject } from './models/dataSetMountObject';
export { DataSetPermission, DataSetPermissionParser } from './models/dataSetPermission';
export { DataSetsAccessLevel, DataSetsAccessLevelParser } from './models/dataSetsAccessLevel';
export {
  AddDataSetExternalEndpointForUserRequest as AddDataSetExternalEndpointRequest,
  AddDataSetExternalEndpointResponse
} from './models/addDataSetExternalEndpoint';
export {
  AddStorageExternalEndpointRequest,
  AddStorageExternalEndpointResponse
} from './models/addStorageExternalEndpoint';
export { GetAccessPermissionRequest } from './models/getAccessPermissionRequest';
export { GetDataSetMountPointRequest, GetDataSetMountPointResponse } from './models/getDataSetMountPoint';
export {
  ExternalEndpoint,
  ExternalEndpointParser,
  CreateExternalEndpoint,
  ExternalEndpointArrayParser
} from './models/externalEndpoint';
export { PermissionsResponse, PermissionsResponseParser } from './models/permissionsResponse';
export { StorageLocation } from './models/storageLocation';

// utilities
export { IamHelper } from './awsUtilities/iamHelper';
export {
  addDatasetPermissionsToRole,
  AddDatasetPermissionsToRoleRequest,
  AddDatasetPermissionsToRoleResponse
} from './awsUtilities/addDatasetPermissionsToRole';
export {
  createRegisterExternalBucketRole,
  CreateRegisterExternalBucketRoleRequest,
  CreateRegisterExternalBucketRoleResponse
} from './awsUtilities/createRegisterExternalBucketRole';

// schema
export { default as AddDatasetPermissionsToRoleSchema } from './schemas/addDatasetPermissionsToRoleSchema';
export { default as CreateDataSetSchema } from './schemas/createDataSet';
export { default as CreateExternalEndpointSchema } from './schemas/createExternalEndpoint';
export { default as CreatePresignedSinglePartFileUploadUrl } from './schemas/createPresignedSinglePartFileUploadUrl';
export { default as CreateRegisterExternalBucketRoleSchema } from './schemas/createRegisterExternalBucketRoleSchema';
