/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface GetAccessPermissionRequest {
  /** the ID of the dataset */
  dataSetId: string;
  /** the user or group for which permissions are sought */
  subject: string;
}
