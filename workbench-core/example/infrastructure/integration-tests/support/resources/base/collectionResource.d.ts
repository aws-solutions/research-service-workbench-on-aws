import { AxiosInstance, AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import Setup from '../../setup';
import Settings from '../../utils/settings';
export default class CollectionResource {
  private _type;
  private _childType;
  protected _axiosInstance: AxiosInstance;
  protected _clientSession: ClientSession;
  protected _settings: Settings;
  protected _parentApi: string;
  protected _api: string;
  protected _setup: Setup;
  constructor(clientSession: ClientSession, type: string, childType: string, parentApi?: string);
  create(body?: any, applyDefault?: boolean): Promise<AxiosResponse>;
  get(queryParams: { [key: string]: string }): Promise<AxiosResponse>;
  protected _buildDefaults(resource?: any): any;
}
//# sourceMappingURL=collectionResource.d.ts.map
