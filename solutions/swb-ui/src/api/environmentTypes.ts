/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import useSWR from 'swr';
import { httpApiGet } from './apiHelper';
import { EnvTypeItem } from '../models/EnvironmentType';

const useEnvironmentType = () => {
  const { data, isValidating } = useSWR(`environmentTypes`, httpApiGet);
  const envTypes: EnvTypeItem[] = ((data && data.data) || []).filter(
    (t: EnvTypeItem) => t.status === 'APPROVED'
  );
  return { envTypes, areEnvTypesLoading: isValidating };
};

export { useEnvironmentType };
