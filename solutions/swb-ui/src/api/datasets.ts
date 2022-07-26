import useSWR from 'swr';
import { DatasetItem } from '../models/Dataset';
import { httpApiGet } from './apiHelper';

const useDatasets = () => {
  const { data, isValidating } = useSWR(() => 'datasets', httpApiGet);
  const datasets: DatasetItem[] = data || [];
  return { datasets, areDatasetsLoading: isValidating };
};

export { useDatasets };
