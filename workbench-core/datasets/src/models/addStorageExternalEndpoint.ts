/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { EndpointConnectionStrings } from '../dataSetsStoragePlugin';
import { DataSetsAccessLevel } from './dataSetsAccessLevel';

export interface AddStorageExternalEndpointRequest {
  /** the name of the storage destination to be accessed */
  name: string;
  /** a string which locates to root of the dataset within the storage medium such as a prefix in an S3 bucket */
  path: string;
  /** a name to uniquely identify the endpoint */
  externalEndpointName: string;
  /** the AWS Account Id where the storage resides */
  ownerAccountId: string;
  /** the {@link DataSetsAccessLevel} to give to the endpoint */
  accessLevel: DataSetsAccessLevel;
  /** an optional role name which the external environment will assume to access the DataSet */
  externalRoleName?: string;
  /** an optional ARN of the KMS key used to encrypt the bucket */
  kmsKeyArn?: string;
  /** an optional ID of the VPC interacting with the endpoint */
  vpcId?: string;
}

export interface AddStorageExternalEndpointResponse {
  data: {
    /** the {@link EndpointConnectionStrings} object */
    connections: EndpointConnectionStrings;
  };
}
