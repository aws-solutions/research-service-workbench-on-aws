import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';
import Dataset from './dataset';
export default class Datasets extends CollectionResource {
  constructor(clientSession: ClientSession);
  dataset(id: string): Dataset;
  import(requestBody: { [id: string]: string }): Promise<AxiosResponse>;
  protected _buildDefaults(resource: DataSetCreateRequest): DataSetCreateRequest;
}
interface DataSetCreateRequest {
  datasetName: string;
  storageName: string;
  path: string;
  awsAccountId: string;
  region: string;
}
export {};
//# sourceMappingURL=datasets.d.ts.map
