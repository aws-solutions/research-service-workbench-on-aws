/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import { Environment, EnvironmentStatus } from '@aws/workbench-core-environments';
import { EnvironmentItem } from '../environments/environmentItem';

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
  ): Promise<{ data: EnvironmentItem[]; paginationToken: string | undefined }>;

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
