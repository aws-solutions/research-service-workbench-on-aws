/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CreateEnvironmentTypeConfigRequest } from './createEnvironmentTypeConfigRequest';
import { DeleteEnvironmentTypeConfigRequest } from './deleteEnvironmentTypeConfigRequest';
import { EnvironmentTypeConfig } from './environmentTypeConfig';
import { GetEnvironmentTypeConfigRequest } from './getEnvironmentTypeConfigRequest';
import { ListEnvironmentTypeConfigsRequest } from './listEnvironmentTypeConfigsRequest';
import { UpdateEnvironmentTypeConfigRequest } from './updateEnvironmentTypeConfigsRequest';

export interface EnvTypeConfigPlugin {
  /**
   * Get Environment Type Config
   *
   * @param request - Environment Type Config Request Object to retrieve
   *
   */
  getEnvTypeConfig(request: GetEnvironmentTypeConfigRequest): Promise<EnvironmentTypeConfig>;

  /**
   * List Environment Type Configs associated with Project
   *
   * @param request - Environment Type Config Params Request to filter
   *
   */
  listEnvTypeConfigs(
    request: ListEnvironmentTypeConfigsRequest
  ): Promise<{ data: EnvironmentTypeConfig[]; paginationToken: string | undefined }>;

  /**
   * Create Environment Type Config
   *
   * @param request - Environment Type Config Request Object to create
   *
   */
  createEnvTypeConfig(request: CreateEnvironmentTypeConfigRequest): Promise<EnvironmentTypeConfig>;

  /**
   * Create Environment Type Config
   *
   * @param request - Environment Type Config Request Object to update
   *
   */
  updateEnvTypeConfig(request: UpdateEnvironmentTypeConfigRequest): Promise<EnvironmentTypeConfig>;

  /**
   * Soft Delete Environment Type Config
   *
   * @param request - Environment Type Config Request Object to soft delete
   *
   */
  deleteEnvTypeConfig(request: DeleteEnvironmentTypeConfigRequest): Promise<void>;
}
