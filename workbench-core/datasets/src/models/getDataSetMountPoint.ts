/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import { DataSetMountObject } from './dataSetMountObject';

export interface GetDataSetMountPointRequest {
  /** the ID of the dataset */
  dataSetId: string;
  /** the ID of the endpoint */
  endpointId: string;
  /** the {@link AuthenticatedUser} making the request */
  authenticatedUser: AuthenticatedUser;
}

export interface GetDataSetMountPointResponse {
  data: {
    mountObject: DataSetMountObject;
  };
}
