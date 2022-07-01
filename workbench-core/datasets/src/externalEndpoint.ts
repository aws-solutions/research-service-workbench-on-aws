export interface ExternalEndpoint {
  [key: string]: string | string[] | undefined;

  id?: string;

  name: string;

  createdAt?: string;

  dataSetId: string;

  dataSetName: string;

  path: string;

  allowedRoles?: string[];

  endPointUrl: string;
}
