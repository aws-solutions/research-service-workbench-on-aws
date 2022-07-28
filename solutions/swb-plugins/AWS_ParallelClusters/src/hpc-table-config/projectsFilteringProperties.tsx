import { FilteringProperty } from '@awsui/collection-hooks/dist/cjs/interfaces';

export const filteringProperties: readonly FilteringProperty[] = [
  {
    key: 'id',
    operators: ['=', '!=', ':', '!:'],
    propertyLabel: 'Project ID',
    groupValuesLabel: 'Project ID Values'
  }
];
