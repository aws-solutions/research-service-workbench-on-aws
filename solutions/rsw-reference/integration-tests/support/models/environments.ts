import { EnvironmentStatus } from '@aws/workbench-core-environments';

export interface EnvironmentItemResponse {
  id: string;
  status: EnvironmentStatus;
}

export interface ListEnvironmentResponse {
  data: {
    data: EnvironmentItemResponse[];
  };
}
