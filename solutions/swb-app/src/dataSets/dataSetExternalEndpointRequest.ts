/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface DataSetExternalEndpointRequest {
  dataSetId: string;
  externalEndpointName: string;
  externalRoleName?: string;
  kmsKeyArn?: string;
  vpcId?: string;
}