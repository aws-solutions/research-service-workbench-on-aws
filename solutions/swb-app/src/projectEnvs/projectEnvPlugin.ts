/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import { PaginatedResponse } from '@aws/workbench-core-base';
import { Environment } from '@aws/workbench-core-environments';
import { EnvironmentItem } from '../environments/environmentItem';

export interface ProjectEnvPlugin {
  /**
   *
   * @param params - the attribute values to create a given environment
   * @param user - the user requesting this operation
   */
  createEnvironment(
    params: {
      description: string;
      name: string;
      projectId: string;
      datasetIds: string[];
      envTypeId: string;
      envTypeConfigId: string;
    },
    user: AuthenticatedUser
  ): Promise<Environment>;

  /**
   *
   * @param projectId - Project Id
   * @param envId - Environment Id
   * @param includeMetadata - If true we get all entries where pk = envId, instead of just the entry where pk = envId and sk = envId
   */
  getEnvironment(projectId: string, envId: string, includeMetadata: boolean): Promise<Environment>;

  /**
   * List Environments associated with Project
   *
   * @param projectId - Project Id
   * @param user - User information
   * @param pageSize - Number of results per page
   * @param paginationToken - Token used for getting specific page of results
   *
   */
  listProjectEnvs(
    projectId: string,
    pageSize?: number,
    paginationToken?: string
  ): Promise<PaginatedResponse<EnvironmentItem>>;

  /**
   * Update Environment associated with Project
   *
   * @param projectId - Project Id
   * @param envId - Environment Id
   * @param updatedValues - Key Value pairs to be updated
   */
  updateEnvironment(
    projectId: string,
    envId: string,
    updatedValues: {
      [key: string]:
        | string
        | { type: string; value: string }
        | { id: string; value: string; description: string }[];
    }
  ): Promise<Environment>;
}
