/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { EnvironmentTypeConfig } from '../envTypeConfigs/environmentTypeConfig';
import { AssociateProjectEnvTypeConfigRequest } from './associateProjectEnvTypeConfigRequest';
import { DisassociateProjectEnvTypeConfigRequest } from './disassociateProjectEnvTypeConfigRequest';
import { GetProjectEnvTypeConfigRequest } from './getProjectEnvTypeConfigRequest';
import { ListEnvTypeConfigProjectsRequest } from './listEnvTypeConfigProjectsRequest';
import { ListProjectEnvTypeConfigsRequest } from './listProjectEnvTypeConfigsRequest';
import { Project } from './project';

export interface ProjectEnvTypeConfigPlugin {
  /**
   * Associate Project with Environment Type Config
   *
   * @param request - Request Object to associate
   *
   */
  associateProjectWithEnvTypeConfig(request: AssociateProjectEnvTypeConfigRequest): Promise<void>;

  /**
   * Disassociate Project and Environment Type Config
   *
   * @param request - Request Object to disassociate
   *
   */
  disassociateProjectAndEnvTypeConfig(request: DisassociateProjectEnvTypeConfigRequest): Promise<void>;

  /**
   * List Environment Type Configs associated with Project
   *
   * @param request - Request Object to filster list of associations
   *
   */
  listProjectEnvTypeConfigs(
    request: ListProjectEnvTypeConfigsRequest
  ): Promise<{ data: EnvironmentTypeConfig[]; paginationToken: string | undefined }>;

  /**
   * Get Environment Type Config associated with Project
   *
   * @param request - Request Object to get Environment Type Config
   *
   */
  getEnvTypeConfig(request: GetProjectEnvTypeConfigRequest): Promise<EnvironmentTypeConfig | undefined>;

  /**
   * List Projects associated with Environment Type Config
   *
   * @param request - Request Object to filster list of associations
   *
   */
  listEnvTypeConfigProjects(
    request: ListEnvTypeConfigProjectsRequest
  ): Promise<{ data: Project[]; paginationToken: string | undefined }>;
}
