/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { resourceTypeToKey } from '@aws/workbench-core-base';
import { InvalidArgumentError } from '../errors';

const IT_ADMIN: string = 'ITAdmin';
const PROJECT_ADMIN: string = 'ProjectAdmin';
const RESEARCHER: string = 'Researcher';

function getITAdminRole(): string {
  return IT_ADMIN;
}

function getProjectAdminRole(projectId: string): string {
  if (!projectId.startsWith(resourceTypeToKey.project.toLowerCase())) {
    throw new InvalidArgumentError();
  }
  return `${projectId}#${PROJECT_ADMIN}`;
}

function getResearcherRole(projectId: string): string {
  if (!projectId.startsWith(resourceTypeToKey.project.toLowerCase())) {
    throw new InvalidArgumentError();
  }
  return `${projectId}#${RESEARCHER}`;
}

export { getITAdminRole, getProjectAdminRole, getResearcherRole };
