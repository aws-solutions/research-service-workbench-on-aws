export type EnvironmentStatus = 'STOPPED' | 'STOPPING' | 'FAILED' | 'COMPLETED' | 'PENDING' | 'TERMINATING';

export interface EnvironmentItemResponse {
  id: string;
  status: EnvironmentStatus;
}

export interface ListEnvironmentResponse {
  data: {
    data: EnvironmentItemResponse[];
  };
}
