import { FilteringProperty } from '@awsui/collection-hooks/dist/cjs/interfaces';

export const filteringProperties: readonly FilteringProperty[] = [
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
  }
];
