import { AxiosInstance, AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import Setup from '../../setup';
import Settings from '../../utils/settings';
export default class Resource {
  private _type;
  private _parentApi;
  protected _settings: Settings;
  protected _axiosInstance: AxiosInstance;
  protected _id: string;
  protected _api: string;
  protected _setup: Setup;
  constructor(clientSession: ClientSession, type: string, id: string, parentApi: string);
  get(): Promise<AxiosResponse>;
  update(body: { [key: string]: string }): Promise<AxiosResponse>;
  delete(): Promise<void>;
  /**
   * Delete any resource that was created
   */
  protected cleanup(): Promise<void>;
}
//# sourceMappingURL=resource.d.ts.map
