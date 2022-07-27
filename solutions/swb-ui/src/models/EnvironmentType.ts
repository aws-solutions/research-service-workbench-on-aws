/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface EnvTypeItem {
  id: string;
  name: string;
  description: string;
  status: EnvironmentTypeStatus;
  type: string;
}
export type EnvironmentTypeStatus = 'APPROVED' | 'NOT_APPROVED';
