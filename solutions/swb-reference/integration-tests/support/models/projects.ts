import { ProjectStatus } from '@aws/swb-app';

export interface ProjectItemResponse {
  id: string;
  status: ProjectStatus;
}

export interface ListProjectsResponse {
  data: {
    data: ProjectItemResponse[];
  };
}
