/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { TableProps } from '@cloudscape-design/components';

export const columnDefinitions: readonly TableProps.ColumnDefinition<object>[] = [
  {
    id: 'datasetName',
    header: 'Dataset name',
    cell: (e: { name: string }) => e.name,
    sortingField: 'name'
  },
  {
    id: 'category',
    header: 'Category',
    cell: () => 'Internal', // TODO: Replace with e.category once implemented
    sortingField: 'category'
  },
  {
    id: 'description',
    header: 'Description',
    cell: () => 'Sample description of this dataset', // TODO: Replace with e.description once implemented
    sortingField: 'description'
  },
];

export const searchableColumns: readonly string[] = [
  'datasetName',
  'category',
  'description'
];