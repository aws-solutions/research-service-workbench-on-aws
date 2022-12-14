import { DataSetsAccessLevel } from './dataSetsAccessLevel';

export interface DataSetPermission {
  /** the user or group associated with the access level */
  subject: string;
  /** the access level (read-only or read-write) */
  accessLevel: DataSetsAccessLevel;
}
