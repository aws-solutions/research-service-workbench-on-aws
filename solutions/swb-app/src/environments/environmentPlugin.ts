/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { EnvironmentItem } from './environmentItem';
import { ListEnvironmentsRequest } from './listEnvironmentsRequest';

export interface EnvironmentPlugin {
  /**
   * List Environments
   *
   * @param request - Environment Params Request to filter
   *
   */
  listEnvironments(
    request: ListEnvironmentsRequest
  ): Promise<{ data: EnvironmentItem[]; paginationToken: string | undefined }>;
}
