/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { httpApiGet } from '@aws/workbench-core-swb-common-ui';
import useSWR from 'swr';
import { DatasetItem } from '../models/Dataset';

const useDatasets = () => {
  const { data, isValidating } = useSWR(() => 'datasets', httpApiGet);
  const datasets: DatasetItem[] = data || [];
  return { datasets, areDatasetsLoading: isValidating };
};

export { useDatasets };
