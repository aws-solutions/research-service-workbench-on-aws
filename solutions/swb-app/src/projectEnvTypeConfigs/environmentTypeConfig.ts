/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface EnvironmentTypeConfig {
  id: string;
  type: string;
  description: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  estimatedCost?: string;
  params: { key: string; value: string }[];
}
