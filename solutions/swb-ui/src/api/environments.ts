import useSWR from 'swr';
import { EnvironmentItem, EnvironmentConnectResponse } from '../models/Environment';
import { httpApiGet, httpApiPut, httpApiDelete } from './apiHelper';

const useEnvironments = () => {
  const { data, mutate } = useSWR('environments', httpApiGet, { refreshInterval: 5000 });

  // `/environments` API returns a JSON in this format
  // { data: [], paginationToken: ''}
  // The paginationToken attribute is only provided if there are more than one page of result
  const environments = (data && data.data) || [];
  environments.forEach((item: EnvironmentItem) => {
    item.workspaceName = item.name;
    item.workspaceStatus = item.status;
    item.project = item.projectId;
  });
  return { environments, mutate };
};

const start = async (id: string): Promise<void> => {
  await httpApiPut(`environments/${id}/start`, {});
};

const stop = async (id: string): Promise<void> => {
  await httpApiPut(`environments/${id}/stop`, {});
};

const terminate = async (id: string): Promise<void> => {
  await httpApiDelete(`environments/${id}`, {});
};

const connect = async (id: string): Promise<EnvironmentConnectResponse> => {
  return await httpApiGet(`environments/${id}/connections`, {});
};

export { useEnvironments, start, stop, terminate, connect };
