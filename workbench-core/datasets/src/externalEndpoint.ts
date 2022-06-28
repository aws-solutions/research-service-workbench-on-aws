export interface ExternalEndpoint {
  [key: string]: string | string[] | undefined;

  id?: string;

  name: string;

  createdAt?: string;

  dataSetName: string;

  path: string;

  allowedRoles?: string[];

  endPointUrl: string;
}
