/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Project } from './project';

interface ListProjectsResponse {
  data: Project[];
  paginationToken: string | undefined;
}

export default ListProjectsResponse;
