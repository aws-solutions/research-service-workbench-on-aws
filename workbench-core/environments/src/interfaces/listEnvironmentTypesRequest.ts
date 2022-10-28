/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryParameterFilter, FilterRequest, SortRequest } from '@aws/workbench-core-base';

export interface ListEnvironmentTypesRequest {
  paginationToken?: string;
  pageSize?: number;
  filter?: EnvironmentTypeFilter;
  sort?: EnvironmentTypeSort;
}

export interface EnvironmentTypeFilter extends FilterRequest {
  status?: QueryParameterFilter<string>;
  name?: QueryParameterFilter<string>;
}

export interface EnvironmentTypeSort extends SortRequest {
  status?: 'desc' | 'asc';
  name?: 'desc' | 'asc';
}
