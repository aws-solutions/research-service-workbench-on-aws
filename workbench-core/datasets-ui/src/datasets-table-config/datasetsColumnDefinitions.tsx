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
    id: 'createdAt',
    header: 'Created at',
    cell: (e: { createdAt: string }) => new Date(e.createdAt).toLocaleString(),
    sortingField: 'createdAt'
  },
  {
    id: 'storageName',
    header: 'Storage name',
    cell: (e: { storageName: string }) => e.storageName,
    sortingField: 'storageName'
  },
  {
    id: 'storageType',
    header: 'Storage type',
    cell: (e: { storageType: string }) => e.storageType,
    sortingField: 'storageType'
  },
  {
    id: 'path',
    header: 'Path',
    cell: (e: { path: string }) => e.path,
    sortingField: 'path'
  },
  {
    id: 'awsAccountId',
    header: 'awsAccountId',
    cell: (e: { awsAccountId: string }) => e.awsAccountId,
    sortingField: 'awsAccountId'
  },
];

export const searchableColumns: readonly string[] = [
  'datasetName',
  'createdAt',
  'project',
  'storageName',
  'storageType',
  'path',
  'awsAccountId'
];