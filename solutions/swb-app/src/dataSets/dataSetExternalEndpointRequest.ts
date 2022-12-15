import { DataSetStoragePlugin } from './dataSetStoragePlugin';

export interface DataSetExternalEndpointRequest {
  dataSetId: string;
  externalEndpointName: string;
  dataSetStoragePlugin: DataSetStoragePlugin;
  externalRoleName?: string;
  kmsKeyArn?: string;
  vpcId?: string;
}
