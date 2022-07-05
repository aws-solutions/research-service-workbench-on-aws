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

export type EnvironmentConnectResponse = {
  authCredResponse: any;
  instructionResponse: string;
};

export type EnvironmentStatus = 'STOPPED' | 'STOPPING' | 'FAILED' | 'COMPLETED' | 'PENDING' | 'TERMINATING';

export interface CreateEnvironmentForm {
  envTypeId?: string;
  name?: string;
  restrictedCIDR?: string;
  projectId?: string;
  envTypeConfigId?: string;
  description?: string;
  envType?: string;
  datasetIds?: [];
}

export interface CreateEnvironmentFormValidation {
  envTypeIdError?: string;
  nameError?: string;
  restrictedCIDRError?: string;
  projectIdError?: string;
  envTypeConfigIdError?: string;
  descriptionError?: string;
}
