/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import useSWR from 'swr';
import {
  EnvironmentItem,
  EnvironmentConnectResponse,
  CreateEnvironmentForm,
  EnvironmentsQueryParams
} from '../models/Environment';
import { httpApiGet, httpApiPut, httpApiPost } from './apiHelper';
import { convertToRecord } from '../common/utils';

const useEnvironments = (params?: EnvironmentsQueryParams) => {
  let queryString = new URLSearchParams(convertToRecord(params)).toString();
  queryString = queryString ? `?${queryString}` : '';
  const { data, mutate, isValidating } = useSWR(`environments${queryString}`, httpApiGet);

  // `/environments` API returns a JSON in this format
  // { data: [], paginationToken: ''}
  // The paginationToken attribute is only provided if there are more than one page of result
  const environments = (data && data.data) || [];
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
