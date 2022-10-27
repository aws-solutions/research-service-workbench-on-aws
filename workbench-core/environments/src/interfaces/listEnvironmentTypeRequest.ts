/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryParameterFilter } from '@aws/workbench-core-base';

export interface ListEnvironmentTypeRequest {
  paginationToken?: string;
  pageSize?: number;
  filter?: EnvironmentTypeFilter;
  sort?: EnvironmentTypeSort;
}

export interface EnvironmentTypeFilter {
  status?: QueryParameterFilter<string>;
  name?: QueryParameterFilter<string>;
}

export interface EnvironmentTypeSort {
  status?: 'desc' | 'asc';
  name?: 'desc' | 'asc';
}
