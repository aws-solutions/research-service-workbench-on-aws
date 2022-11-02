/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '@aws/workbench-core-authorization';

interface GetProjectRequest {
  user: AuthenticatedUser;
  projectId: string;
}

export default GetProjectRequest;
