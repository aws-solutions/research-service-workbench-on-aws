export type EnvironmentItem = {
  workspaceName: string;
  workspaceStatus: EnvironmentStatus;
  createdAt: string;
  project: string;
  owner: string;
  workspaceCost: number;
  name: string;
  status: EnvironmentStatus;
  projectId: string;
};

export type EnvironmentActionResponse = {
  envId: string;
  status: EnvironmentStatus;
};
export type EnvironmentStatus = 'STOPPED' | 'STOPPING' | 'FAILED' | 'COMPLETED' | 'PENDING' | 'TERMINATING';
