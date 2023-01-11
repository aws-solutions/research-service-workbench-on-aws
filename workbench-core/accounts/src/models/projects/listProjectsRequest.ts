/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import { QueryParameterFilter, FilterRequest, SortRequest } from '@aws/workbench-core-base';

export interface ListProjectsRequest {
  user: AuthenticatedUser;
  pageSize?: number;
  paginationToken?: string;
  filter?: ProjectFilter;
  sort?: ProjectSort;
}

export interface ProjectFilter extends FilterRequest {
  createdAt?: QueryParameterFilter<string>;
  dependency?: QueryParameterFilter<string>;
  name?: QueryParameterFilter<string>;
  status?: QueryParameterFilter<string>;
}

export interface ProjectSort extends SortRequest {
  createdAt?: 'desc' | 'asc';
  dependency?: 'desc' | 'asc';
  status?: 'desc' | 'asc';
  name?: 'desc' | 'asc';
}

export const listProjectGSINames: string[] = [
  'getResourceByCreatedAt',
  'getResourceByDependency',
  'getResourceByName',
  'getResourceByStatus'
];
