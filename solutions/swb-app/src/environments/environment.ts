/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { EnvironmentStatus } from '@aws/workbench-core-environments';

export interface Environment {
  id: string;
  instanceId: string | undefined;
  cidr: string;
  description: string;
  error: { type: string; value: string } | undefined;
  name: string;
  outputs: { id: string; value: string; description: string }[];
  projectId: string;
  status: EnvironmentStatus;
  provisionedProductId: string;
  envTypeConfigId: string;
  updatedAt: string;
  updatedBy: string;
  createdAt: string;
  createdBy: string;
  owner: string;
  type: string;
  dependency: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ETC?: any;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  PROJ?: any;
  // TODO: Replace any[] with <type>[]
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  DATASETS?: any[];
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ENDPOINTS?: any[];
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  INID?: any;
}
