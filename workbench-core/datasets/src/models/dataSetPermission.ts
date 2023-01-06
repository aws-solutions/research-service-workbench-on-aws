/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DataSetsAccessLevel } from './dataSetsAccessLevel';

export interface DataSetPermission {
  /** the user or group associated with the access level */
  identity: string;
  /** the type of subject (group or user) */
  identityType: string;
  /** the access level (read-only or read-write) */
  accessLevel: DataSetsAccessLevel;
}
