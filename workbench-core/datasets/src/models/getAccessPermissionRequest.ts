export interface GetAccessPermissionRequest {
  /** the ID of the dataset */
  dataSetId: string;
  /** the user or group for which permissions are sought */
  subject: string;
}
