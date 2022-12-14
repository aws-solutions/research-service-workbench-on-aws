/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DataSetPermission } from './dataSetPermission';

export interface GetDataSetMountPointRequest {
  /** the ID of the dataset */
  dataSetId: string;
  /** the ID of the endpoint */
  endPointId: string;
  /** the desired permissions for the endpoint */
  permission: DataSetPermission;
}
