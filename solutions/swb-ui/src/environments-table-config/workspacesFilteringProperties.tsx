import { FilteringProperty } from '@awsui/collection-hooks/dist/cjs/interfaces';

export const filteringProperties: readonly FilteringProperty[] = [
  {
    key: 'workspace',
    operators: ['=', '!=', ':', '!:'],
    propertyLabel: 'Workspace',
    groupValuesLabel: 'Workspace Values'
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
  },
  {
    key: 'connections',
    operators: ['=', '!=', '>=', '<=', '>', '<'],
    propertyLabel: 'Connections',
    groupValuesLabel: 'Connections Values'
  }
];
