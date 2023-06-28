/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { PaginatedResponse } from '@aws/workbench-core-base';
import { EnvironmentItem } from './environmentItem';
import { ListEnvironmentsRequest } from './listEnvironmentsRequest';

export interface EnvironmentPlugin {
  /**
   * List Environments
   *
   * @param request - Environment Params Request to filter
   *
   */
  listEnvironments(request: ListEnvironmentsRequest): Promise<PaginatedResponse<EnvironmentItem>>;
}
