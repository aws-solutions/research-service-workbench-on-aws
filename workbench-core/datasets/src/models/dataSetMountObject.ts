/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface DataSetMountObject {
  /** the name of the data set */
  name: string;
  /** the endpoint URL */
  bucket: string;
  /** the path to the data set storage */
  prefix: string;
  /** the endpoint's ID */
  endpointId: string;
}
