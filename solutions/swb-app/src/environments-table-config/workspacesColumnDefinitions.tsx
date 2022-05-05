export const columnDefinitions = [
  {
    id: 'workspace',
    header: 'Workspace',
    cell: (e: { workspace: string }) => e.workspace
  },
  {
    id: 'workspaceStatus',
    header: 'Workspace status',
    cell: (e: { workspaceStatus: string }) => e.workspaceStatus
  },
  {
    id: 'updatedAt',
    header: 'Updated at',
    cell: (e: { updatedAt: string }) => e.updatedAt,
    sortingField: 'updatedAt'
  },
  {
    id: 'project',
    header: 'Project',
    cell: (e: { project: string }) => e.project
  },
  {
    id: 'owner',
    header: 'Owner',
    cell: (e: { owner: string }) => e.owner
  },
  {
    id: 'connections',
    header: 'Connections',
    cell: (e: { connections: number }) => e.connections
  },
  {
    id: 'workspaceActions',
    header: 'Workspace actions',
    cell: (e: { workspaceActions: JSX.Element }) => e.workspaceActions
  }
];
