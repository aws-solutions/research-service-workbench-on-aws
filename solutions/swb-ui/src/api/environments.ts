import useSWR from 'swr';
import { httpApiGet, httpApiPut, httpApiDelete } from './apiHelper';
import { EnvironmentItem } from '../models/Environment';

const useEnvironments = () => {
  const { data, error, mutate } = useSWR('environments', httpApiGet, { refreshInterval: 5000 });
  (data || []).forEach((item: EnvironmentItem) => {
    item.workspaceName = item.name;
    item.workspaceStatus = item.status;
    item.project = item.projectId;
  });
  return { environments: data || [], mutate };
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

export { useEnvironments, start, stop, terminate };
