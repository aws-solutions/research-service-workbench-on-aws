/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { httpApiGet } from '@aws/workbench-core-swb-common-ui';
import useSWR from 'swr';
import { EnvTypeItem } from '../models/EnvironmentType';

const useEnvironmentType = (): { envTypes: EnvTypeItem[]; areEnvTypesLoading: boolean } => {
  const { data, isValidating } = useSWR(`environmentTypes`, httpApiGet);
  const envTypes: EnvTypeItem[] = (data?.data ?? []).filter((t: EnvTypeItem) => t.status === 'APPROVED');
  return { envTypes, areEnvTypesLoading: isValidating };
};

export { useEnvironmentType };
