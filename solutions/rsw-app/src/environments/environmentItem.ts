/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
export interface EnvironmentItem {
  id: string;
  instanceId?: string;
  projectId: string;
  name: string;
  description: string;
  status: string;
  envTypeConfigId: string;
  provisionedProductId: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}
