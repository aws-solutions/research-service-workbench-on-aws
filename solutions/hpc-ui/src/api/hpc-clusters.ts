import useSWR from 'swr';
import { httpApiGet, httpApiPut } from './apiHelper';
import { Cluster, Job } from '../models/Cluster';

const getClusters = async (projectId: string): Promise<Cluster[]> => {
  console.log('Project ID inside of getClusters', projectId);

  return await httpApiGet(`projects/${projectId}/clusters`, {});
};

const useCluster = (projectId: string, clusterName: string) => {
  const { data, mutate } = useSWR(`projects/${projectId}/clusters/${clusterName}`, httpApiGet, {
    refreshInterval: 15000
  });

  let cluster = data as Cluster;

  let clusterMutate = mutate;

  return { cluster, clusterMutate };
};

const useJobQueue = (projectId: string, clusterName: string, instanceId: string) => {
  const { data, mutate } = useSWR(
    `projects/${projectId}/clusters/${clusterName}/headNode/${instanceId}/jobs`,
    httpApiGet,
    { refreshInterval: 5000 }
  );

  let jobs = ((data && data.StandardOutputContent) || []) as unknown as Job[];

  let jobMutate = mutate;

  return { jobs, jobMutate };
};

const stopJob = async (
  projectId: string,
  clusterName: string,
  instanceId: string,
  jobId: number
): Promise<void> => {
  await httpApiPut(
    `projects/${projectId}/clusters/${clusterName}/headNode/${instanceId}/jobs/${jobId}/cancel`,
    {}
  );
};

export { getClusters, useCluster, useJobQueue, stopJob };
