/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DataSetPermission } from './dataSetPermission';

export interface AddRemoveAccessPermissionRequest {
  /** the ID of the dataset */
  dataSetId: string;
  /** the permission to add or remove */
  permission: DataSetPermission;
}