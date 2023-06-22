/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { httpApiGet } from '@aws/workbench-core-swb-common-ui';
import useSWR from 'swr';
import { ProjectItem } from '../models/Project';

const useProjects = (): { projects: ProjectItem[]; areProjectsLoading: boolean } => {
  const { data, isValidating } = useSWR(() => 'projects', httpApiGet);
  const projects: ProjectItem[] = data?.data ?? [];
  return { projects, areProjectsLoading: isValidating };
};

export { useProjects };
