/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { PropertyFilterProperty } from '@cloudscape-design/collection-hooks/dist/cjs/interfaces';

export const filteringProperties: readonly PropertyFilterProperty[] = [
  {
    key: 'datasetName',
    operators: ['=', '!=', ':', '!:'],
    propertyLabel: 'Dataset Name',
    groupValuesLabel: 'Dataset Name Values'
  },
  {
    key: 'category',
    operators: ['=', '!='],
    propertyLabel: 'Dataset Category',
    groupValuesLabel: 'Dataset Category Values'
  },
  {
    key: 'description',
    operators: ['=', '!='],
    propertyLabel: 'Dataset Description',
    groupValuesLabel: 'Dataset Description Values'
  }
];