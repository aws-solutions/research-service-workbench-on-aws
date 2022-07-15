import { TableProps } from '@awsui/components-react';

export const columnDefinitions: readonly TableProps.ColumnDefinition<object>[] = [
  {
    id: 'workspaceName',
    header: 'Workspace name',
    cell: (e: { workspaceName: string }) => e.workspaceName,
    sortingField: 'workspaceName'
  },
  {
    id: 'workspaceStatus',
    header: 'Workspace status',
    cell: (e: { workspaceStatus: string }) => e.workspaceStatus,
    sortingField: 'workspaceStatus'
  },
  {
    id: 'createdAt',
    header: 'Created at',
    cell: (e: { createdAt: string }) => e.createdAt,
    sortingField: 'createdAt'
  },
  {
    id: 'project',
    header: 'Project',
    cell: (e: { project: string }) => e.project,
    sortingField: 'project'
  },
  {
    id: 'owner',
    header: 'Owner',
    cell: (e: { owner: string }) => e.owner,
    sortingField: 'owner'
  }
];

export const searchableColumns: string[] = [
  'workspaceName',
  'workspaceStatus',
  'createdAt',
  'project',
  'owner'
];
