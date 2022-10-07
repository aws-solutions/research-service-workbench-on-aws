/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { httpApiGet } from '@aws/workbench-core-swb-common-ui';
import useSWR from 'swr';
import { EnvTypeConfigItem } from '../models/EnvironmentTypeConfig';

const useEnvTypeConfigs = (
  id: string
): { envTypeConfigs: EnvTypeConfigItem[]; areEnvTypeConfigsLoading: boolean } => {
  const { data, isValidating } = useSWR(
    () => (id ? `environmentTypes/${id}/configurations` : null),
    httpApiGet
  );
  const envTypeConfigs: EnvTypeConfigItem[] = data?.data ?? [];
  return { envTypeConfigs, areEnvTypeConfigsLoading: isValidating };
};

export { useEnvTypeConfigs };
