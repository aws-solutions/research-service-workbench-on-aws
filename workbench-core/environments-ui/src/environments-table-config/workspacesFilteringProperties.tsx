/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { PropertyFilterProperty } from '@cloudscape-design/collection-hooks/dist/cjs/interfaces';

export const filteringProperties: readonly PropertyFilterProperty[] = [
  {
    key: 'workspaceName',
    operators: ['=', '!=', ':', '!:'],
    propertyLabel: 'Workspace Name',
    groupValuesLabel: 'Workspace Name Values'
  },
  {
    key: 'workspaceStatus',
    operators: ['=', '!='],
    propertyLabel: 'Workspace Status',
    groupValuesLabel: 'Workspace Status Values'
  },
  {
    key: 'project',
    operators: ['=', '!=', ':', '!:'],
    propertyLabel: 'Project',
    groupValuesLabel: 'Project Values'
  },
  {
    key: 'owner',
    operators: ['=', '!=', ':', '!:'],
    propertyLabel: 'Owner',
    groupValuesLabel: 'Owner Values'
  }
];
