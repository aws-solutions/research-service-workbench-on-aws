/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export { DataSet } from './dataSet';
export { DataSetMetadataPlugin } from './dataSetMetadataPlugin';
export { DataSetService } from './dataSetService';
export { DataSetsStoragePlugin } from './dataSetsStoragePlugin';
export { DdbDataSetMetadataPlugin } from './ddbDataSetMetadataPlugin';
export { EndPointExistsError, isEndPointExistsError } from './errors/endPointExistsError';
export { isRoleExistsOnEndpointError, RoleExistsOnEndpointError } from './errors/roleExistsOnEndpointError';
export { InvalidIamRoleError, isInvalidIamRoleError } from './errors/invalidIamRoleError';
export { ExternalEndpoint } from './externalEndpoint';
export { IamHelper } from './awsUtilities/iamHelper';
export { S3DataSetStoragePlugin } from './s3DataSetStoragePlugin';
export { StorageLocation } from './storageLocation';
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

export { DataSetType } from './models/dataSetType';
