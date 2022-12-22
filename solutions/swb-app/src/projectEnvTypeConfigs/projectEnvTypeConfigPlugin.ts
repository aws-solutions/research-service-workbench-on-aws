/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { EnvironmentTypeConfig } from './environmentTypeConfig';
import { ListProjectEnvTypeConfigsRequest } from './listProjectEnvTypeConfigsRequest';

export interface ProjectEnvTypeConfigPlugin {
  /**
   * Associate Project with Environment Type Config
   *
   * @param projectId - Project Id to associate
   * @param envTypeId - Environment Type Id of environment type config to associate
   * @param envTypeConfigId - Environment Type Config Id to associate
   *
   */
  associateProjectWithEnvTypeConfig(
    projectId: string,
    envTypeId: string,
    envTypeConfigId: string
  ): Promise<void>;

  /**
   * Disassociate Project and Environment Type Config
   *
   * @param projectId - Project Id to disassociate
   * @param envTypeId - Environment Type Id of environment type config to associate
   * @param envTypeConfigId - Environment Type Config Id to disassociate
   *
   */
  disassociateProjectAndEnvTypeConfig(
    projectId: string,
    envTypeId: string,
    envTypeConfigId: string
  ): Promise<void>;

  /**
   * List Environment Type Configs associated with Project
   *
   * @param projectId - Project Id
   * @param envTypeId - Environment Type Id
   *
   */
  listProjectEnvTypeConfigs(
    request: ListProjectEnvTypeConfigsRequest
  ): Promise<{ data: EnvironmentTypeConfig[]; paginationToken: string | undefined }>;
}
