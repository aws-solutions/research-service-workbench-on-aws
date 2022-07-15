import { FilteringProperty } from '@awsui/collection-hooks/dist/cjs/interfaces';

export const filteringProperties: readonly FilteringProperty[] = [
  {
    key: 'job_id',
    operators: ['=', '!=', ':', '!:'],
    propertyLabel: 'Job ID',
    groupValuesLabel: 'Job ID Values'
  }
];
