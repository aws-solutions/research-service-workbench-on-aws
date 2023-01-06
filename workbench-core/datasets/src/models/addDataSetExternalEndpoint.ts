/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DataSetMountObject } from '../dataSetService';
import { DataSetsStoragePlugin } from '../dataSetsStoragePlugin';

export interface AddDataSetExternalEndpointForUserRequest {
  /** the name of the DataSet to which the endpoint will be added */
  dataSetId: string;
  /** the name of the endpoint to add */
  externalEndpointName: string;
  /** an instance of {@link DataSetsStoragePlugin} initialized with permissions to modify the target DataSet's underlying storage */
  storageProvider: DataSetsStoragePlugin;
  /** the userId to create the endpoint for */
  userId: string;
  /** a role which will interact with the endpoint */
  externalRoleName?: string;
  /** an optional ARN of the KMS key used to encrypt the bucket */
  kmsKeyArn?: string;
  /** an optional ID of the VPC interacting with the endpoint */
  vpcId?: string;
}

export interface AddDataSetExternalEndpointResponse {
  data: {
    /** the {@link DataSetMountObject} */
    mountObject: DataSetMountObject;
  };
}
