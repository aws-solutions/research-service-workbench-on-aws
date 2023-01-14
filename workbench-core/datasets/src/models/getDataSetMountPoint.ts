/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser, IdentityType } from '@aws/workbench-core-authorization';
import { DataSetMountObject } from './dataSetMountObject';

export interface GetDataSetMountPointRequest {
  /** the ID of the dataset */
  dataSetId: string;
  /** the ID of the endpoint */
  endPointId: string;
  /** the identity (userId or groupId) to request the mount object for */
  identity: string;
  /** the {@link IdentityType} of the identity */
  identityType: IdentityType;
  /** the {@link AuthenticatedUser} making the request */
  authenticatedUser: AuthenticatedUser;
}

export interface GetDataSetMountPointResponse {
  data: {
    mountObject: DataSetMountObject;
  };
}
