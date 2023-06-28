import { ProjectStatus } from '@aws/workbench-core-accounts/lib/constants/projectStatus';

export interface ProjectItemResponse {
  id: string;
  status: ProjectStatus;
}

export interface ListProjectsResponse {
  data: {
    data: ProjectItemResponse[];
  };
}
