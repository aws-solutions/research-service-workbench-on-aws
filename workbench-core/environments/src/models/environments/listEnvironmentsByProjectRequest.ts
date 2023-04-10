/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export interface ListEnvironmentsByProjectRequest {
  projectId: string;
  pageSize?: number;
  paginationToken?: string;
  sort?: 'asc' | 'desc';
}
