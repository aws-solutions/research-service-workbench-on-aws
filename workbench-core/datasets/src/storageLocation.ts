/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface StorageLocation {
  name: string;
  awsAccountId?: string;
  type?: string;
  region?: string;
}
