/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { FilteringProperty } from '@awsui/collection-hooks/dist/cjs/interfaces';

export const filteringProperties: readonly FilteringProperty[] = [
  {
    key: 'datasetName',
    operators: ['=', '!=', ':', '!:'],
    propertyLabel: 'Dataset Name',
    groupValuesLabel: 'Dataset Name Values'
  },
  {
    key: 'storageName',
    operators: ['=', '!='],
    propertyLabel: 'Storage Name',
    groupValuesLabel: 'Storage Name Values'
  },
  {
    key: 'storageType',
    operators: ['=', '!='],
    propertyLabel: 'Storage Type',
    groupValuesLabel: 'Storage Type Values'
  },
  {
    key: 'path',
    operators: ['=', '!=', ':', '!:'],
    propertyLabel: 'Path',
    groupValuesLabel: 'Path Values'
  }
];
