import useSWR from 'swr';
import { EnvironmentItem, EnvironmentConnectResponse, CreateEnvironmentForm } from '../models/Environment';
import { httpApiGet, httpApiPut, httpApiPost } from './apiHelper';

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
