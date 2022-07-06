import { TableProps } from '@awsui/components-react';

export const columnDefinitions: readonly TableProps.ColumnDefinition<object>[] = [
  {
    id: 'clusterName',
    header: 'Cluster Name',
    cell: (e: { clusterName: string }) => e.clusterName,
    sortingField: 'clusterName'
  }
];

export const searchableColumns: string[] = ['clusterName'];
