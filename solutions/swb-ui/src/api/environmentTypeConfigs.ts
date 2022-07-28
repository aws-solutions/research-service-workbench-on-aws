/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import useSWR from 'swr';
import { httpApiGet } from './apiHelper';
import { EnvTypeConfigItem } from '../models/EnvironmentTypeConfig';

const useEnvTypeConfigs = (id: string) => {
  const { data, isValidating } = useSWR(
    () => (id ? `environmentTypes/${id}/configurations` : null),
    httpApiGet
  );
  const envTypeConfigs: EnvTypeConfigItem[] = (data && data.data) || [];
  return { envTypeConfigs, areEnvTypeConfigsLoading: isValidating };
};

export { useEnvTypeConfigs };
