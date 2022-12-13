import { CreateProvisionDatasetRequest } from '@aws/swb-app/lib/datasets/createProvisionDatasetRequest';
import { DataSet } from '@aws/swb-app/lib/datasets/dataSet';
import { DatasetPluginInterface } from '@aws/swb-app/lib/datasets/datasetPluginInterface';
import { DataSetsStoragePluginInterface } from '@aws/swb-app/lib/datasets/dataSetsStoragePluginInterface';
import { AuditService } from '@aws/workbench-core-audit';
import {
  DataSetMetadataPlugin,
  DataSetService as WorkbenchDataSetService
} from '@aws/workbench-core-datasets';
import { LoggingService } from '@aws/workbench-core-logging';

export class DataSetService implements DatasetPluginInterface {
  public readonly storagePlugin: DataSetsStoragePluginInterface;
  private _workbenchDataSetService: WorkbenchDataSetService;

  public constructor(
    storagePlugin: DataSetsStoragePluginInterface,
    audit: AuditService,
    log: LoggingService,
    masterDbProvider: DataSetMetadataPlugin
  ) {
    this._workbenchDataSetService = new WorkbenchDataSetService(audit, log, masterDbProvider);
    this.storagePlugin = storagePlugin;
  }

  public addDataSetExternalEndpoint(
    dataSetId: string,
    externalEndpointName: string,
    storageProvider: DataSetsStoragePluginInterface,
    externalRoleName?: string,
    kmsKeyArn?: string,
    vpcId?: string
  ): Promise<Record<string, string>> {
    return this._workbenchDataSetService.addDataSetExternalEndpoint(
      dataSetId,
      externalEndpointName,
      storageProvider,
      externalRoleName,
      kmsKeyArn,
      vpcId
    );
  }

  public getDataSet(dataSetId: string): Promise<DataSet> {
    return this._workbenchDataSetService.getDataSet(dataSetId);
  }

  public importDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet> {
    return this._workbenchDataSetService.importDataSet(request);
  }

  public listDataSets(): Promise<DataSet[]> {
    return this._workbenchDataSetService.listDataSets();
  }

  public provisionDataSet(request: CreateProvisionDatasetRequest): Promise<DataSet> {
    return this._workbenchDataSetService.provisionDataSet(request);
  }
}
