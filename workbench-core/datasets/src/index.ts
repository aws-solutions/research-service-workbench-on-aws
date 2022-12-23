/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import AddDatasetPermissionsToRoleSchema from './schemas/addDatasetPermissionsToRoleSchema';
import CreateDataSetSchema from './schemas/createDataSet';
import CreateExternalEndpointSchema from './schemas/createExternalEndpoint';
import CreatePresignedSinglePartFileUploadUrl from './schemas/createPresignedSinglePartFileUploadUrl';
import CreateRegisterExternalBucketRoleSchema from './schemas/createRegisterExternalBucketRoleSchema';

export { DataSet } from './dataSet';
export { DataSetsAuthorizationPlugin } from './dataSetsAuthorizationPlugin';
export { DataSetMetadataPlugin } from './dataSetMetadataPlugin';
export { DataSetService } from './dataSetService';
export { DataSetsStoragePlugin } from './dataSetsStoragePlugin';
export { DdbDataSetMetadataPlugin } from './ddbDataSetMetadataPlugin';
export { DataSetHasEndpointError, isDataSetHasEndpointError } from './errors/dataSetHasEndpointError';
export { EndPointExistsError, isEndPointExistsError } from './errors/endPointExistsError';
export { isRoleExistsOnEndpointError, RoleExistsOnEndpointError } from './errors/roleExistsOnEndpointError';
export { InvalidIamRoleError, isInvalidIamRoleError } from './errors/invalidIamRoleError';
export { ExternalEndpoint } from './externalEndpoint';
export { IamHelper } from './awsUtilities/iamHelper';
export { S3DataSetStoragePlugin } from './s3DataSetStoragePlugin';
export {
  AddDatasetPermissionsToRoleSchema,
  CreateDataSetSchema,
  CreateExternalEndpointSchema,
  CreatePresignedSinglePartFileUploadUrl,
  CreateRegisterExternalBucketRoleSchema
};
export { StorageLocation } from './storageLocation';
export { WbcDataSetsAuthorizationPlugin } from './wbcDataSetsAuthorizationPlugin';
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
