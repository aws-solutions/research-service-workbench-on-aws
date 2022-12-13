import { CreateProvisionDatasetRequest } from './createProvisionDatasetRequest';
import { DataSet } from './dataSet';
import { DataSetsStoragePluginInterface } from './dataSetsStoragePluginInterface';

export interface DatasetPluginInterface {
  storagePlugin: DataSetsStoragePluginInterface;

  provisionDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet>;
  importDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet>;
  addDataSetExternalEndpoint(
    dataSetId: string,
    externalEndpointName: string,
    storageProvider: DataSetsStoragePluginInterface,
    externalRoleName?: string,
    kmsKeyArn?: string,
    vpcId?: string
  ): Promise<Record<string, string>>;
  getDataSet(dataSetId: string): Promise<DataSet>;
  listDataSets(): Promise<DataSet[]>;
}
