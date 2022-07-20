import { TableProps } from '@awsui/components-react';

export const columnDefinitions: readonly TableProps.ColumnDefinition<object>[] = [
  {
    id: 'id',
    header: 'User id',
    cell: (e: { id: string }) => e.id,
    sortingField: 'id'
  }
];

export const searchableColumns: string[] = ['id'];
