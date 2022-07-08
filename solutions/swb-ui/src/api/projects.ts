import useSWR from 'swr';
import { httpApiGet } from './apiHelper';
import { ProjectItem } from '../models/Project';

const useProjects = () => {
  const { data, isValidating } = useSWR(() => 'projects', httpApiGet);
  const projects: ProjectItem[] = (data && data.data) || [];
  return { projects, areProjectsLoading: isValidating };
};

export { useProjects };
