import { AccessPoint } from '@aws-sdk/client-s3-control';
export declare class DatasetHelper {
  private _awsSdk;
  constructor();
  listAccessPoints(bucket: string, accountId: string): Promise<Array<AccessPoint>>;
  deleteS3Resources(bucket: string, dir: string): Promise<void>;
  deleteDdbRecords(dataSetId: string): Promise<void>;
}
//# sourceMappingURL=datasetHelper.d.ts.map
