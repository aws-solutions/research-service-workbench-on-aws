/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import { Environment, EnvironmentStatus } from './environment';

export interface ProjectEnvPlugin {
  /**
   *
   * @param params - the attribute values to create a given environment
   * @param user - the user requesting this operation
   */
  createEnvironment(
    params: {
      instanceId?: string;
      cidr: string;
      description: string;
      error?: { type: string; value: string };
      name: string;
      outputs: { id: string; value: string; description: string }[];
      projectId: string;
      datasetIds: string[];
      envTypeId: string;
      envTypeConfigId: string;
      status?: EnvironmentStatus;
    },
    user: AuthenticatedUser
  ): Promise<Environment>;

  /**
   *
   * @param envId - Environment Id
   * @param projectId - Project Id
   * @param includeMetadata - If true we get all entries where pk = envId, instead of just the entry where pk = envId and sk = envId
   */
  getEnvironment(envId: string, projectId: string, includeMetadata: boolean): Promise<Environment>;

  /**
   * List Environments associated with Project
   *
   * @param projectId - Project Id
   * @param user - User information
   * @param filter - Provide which attribute to filter by
   * @param pageSize - Number of results per page
   * @param paginationToken - Token used for getting specific page of results
   * @param sort - Provide which attribute to sort by. True for ascending sort; False for descending sort
   *
   */
  listProjectEnvs(
    projectId: string,
    paginationParams: string
  ): Promise<{ data: Environment[]; paginationToken: string | undefined }>;

  /**
   * Update Environment associated with Project
   *
   * @param envId - Environment Id
   * @param projectId - Project Id
   * @param updatedValues - Key Value pairs to be updated
   */
  updateEnvironment(
    envId: string,
    projectId: string,
    updatedValues: {
      [key: string]:
        | string
        | { type: string; value: string }
        | { id: string; value: string; description: string }[];
    }
  ): Promise<Environment>;
}
