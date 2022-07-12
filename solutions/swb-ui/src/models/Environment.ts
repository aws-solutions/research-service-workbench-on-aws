export interface EnvironmentItem {
  workspaceName: string;
  workspaceStatus: EnvironmentStatus;
  createdAt: string;
  project: string;
  owner: string;
  workspaceCost: number;
  name: string;
  status: EnvironmentStatus;
  projectId: string;
}

export interface EnvironmentActionResponse {
  envId: string;
  status: EnvironmentStatus;
}

export interface EnvironmentConnectResponse {
  authCredResponse: any;
  instructionResponse: string;
}

export type EnvironmentStatus = 'STOPPED' | 'STOPPING' | 'FAILED' | 'COMPLETED' | 'PENDING' | 'TERMINATING';

export interface CreateEnvironmentForm {
  envTypeId?: string;
  name?: string;
  cidr?: string;
  projectId?: string;
  envTypeConfigId?: string;
  description?: string;
  envType?: string;
  datasetIds?: string[];
}

export interface CreateEnvironmentFormValidation {
  envTypeIdError?: string;
  nameError?: string;
  cidrError?: string;
  projectIdError?: string;
  envTypeConfigIdError?: string;
  descriptionError?: string;
}
