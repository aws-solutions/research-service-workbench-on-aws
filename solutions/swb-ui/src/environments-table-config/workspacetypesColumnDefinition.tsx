import { TableProps } from '@awsui/components-react';

export const columnDefinitions: readonly TableProps.ColumnDefinition<object>[] = [
  {
    id: 'name',
    header: 'Workspace Name',
    cell: (e: { name: string }) => e.name,
    sortingField: 'name'
  },
  {
    id: 'approval',
    header: 'Approval',
    cell: (e: { approval: string }) => e.approval
  },

  {
    id: 'description',
    header: 'Description',
    cell: (e: { description: string }) => e.description
  }
];
