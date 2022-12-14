import { DataSetPermission } from './dataSetPermission';

export interface PermissionsResponse {
  data: {
    /** the ID of the dataset for which the permissions are associated. */
    dataSetId: string;
    /** dataset permissions */
    permissions: DataSetPermission[];
  };
  pageToken: string;
}
