import { TableProps } from '@awsui/components-react';

export const columnDefinitions: readonly TableProps.ColumnDefinition<object>[] = [
  {
    id: 'name',
    header: 'Variable name',
    cell: (e: { name: string }) => e.name,
    sortingField: 'name'
  },
  {
    id: 'description',
    header: 'Description',
    cell: (e: { description: string }) => e.description
  }
];
