/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { convertToRecord, httpApiGet, httpApiPut, httpApiPost } from '@aws/workbench-core-swb-common-ui';
import useSWR, { KeyedMutator } from 'swr';
import {
  EnvironmentItem,
  EnvironmentConnectResponse,
  CreateEnvironmentForm,
  EnvironmentsQueryParams
} from '../models/Environment';

const useEnvironments = (
  params?: EnvironmentsQueryParams
): {
  environments: { workspaceName: string; workspaceStatus: string; project: string }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mutate: KeyedMutator<any>;
  paginationToken: string;
  areEnvironmentsLoading: boolean;
} => {
  let queryString = new URLSearchParams(convertToRecord(params)).toString();
  queryString = queryString ? `?${queryString}` : '';
  const { data, mutate, isValidating } = useSWR(`environments${queryString}`, httpApiGet, {
    refreshInterval: 20000
  });

  // `/environments` API returns a JSON in this format
  // { data: [], paginationToken: ''}
  // The paginationToken attribute is only provided if there are more than one page of result
  const environments = data?.data ?? [];
  environments.forEach((item: EnvironmentItem) => {
    item.workspaceName = item.name;
    item.workspaceStatus = item.status;
    item.project = item.projectId;
  });
  return {
    environments,
    mutate,
    paginationToken: data && data.paginationToken,
    areEnvironmentsLoading: isValidating
  };
};

const createEnvironment = async (environment: CreateEnvironmentForm): Promise<void> => {
  await httpApiPost('environments', { ...environment });
};

const start = async (id: string): Promise<void> => {
  await httpApiPut(`environments/${id}/start`, {});
};

const stop = async (id: string): Promise<void> => {
  await httpApiPut(`environments/${id}/stop`, {});
};

const terminate = async (id: string): Promise<void> => {
  await httpApiPut(`environments/${id}/terminate`, {});
};

const connect = async (id: string): Promise<EnvironmentConnectResponse> => {
  return httpApiGet(`environments/${id}/connections`, {});
};

export { useEnvironments, start, stop, terminate, connect, createEnvironment };
