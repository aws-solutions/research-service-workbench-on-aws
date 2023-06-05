import { EnvironmentStatus } from '@aws/swb-app';

export interface EnvironmentItemResponse {
  id: string;
  status: EnvironmentStatus;
}

export interface ListEnvironmentResponse {
  data: {
    data: EnvironmentItemResponse[];
  };
}
