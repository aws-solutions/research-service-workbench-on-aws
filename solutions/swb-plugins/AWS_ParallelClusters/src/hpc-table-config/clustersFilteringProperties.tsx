import { FilteringProperty } from '@awsui/collection-hooks/dist/cjs/interfaces';

export const filteringProperties: readonly FilteringProperty[] = [
  {
    key: 'clusterName',
    operators: ['=', '!=', ':', '!:'],
    propertyLabel: 'Cluster Name',
    groupValuesLabel: 'Cluster Name Values'
  }
];
