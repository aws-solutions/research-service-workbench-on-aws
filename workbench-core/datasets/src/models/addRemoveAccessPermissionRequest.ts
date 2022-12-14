import { DataSetPermission } from './dataSetPermission';

export interface AddRemoveAccessPermissionRequest {
  /** the ID of the dataset */
  dataSetId: string;
  /** the permission to add or remove */
  permission: DataSetPermission;
}
