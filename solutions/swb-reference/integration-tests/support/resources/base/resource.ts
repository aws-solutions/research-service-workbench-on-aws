import { AxiosInstance } from 'axios';
import _ from 'lodash';
import ClientSession from '../../clientSession';
import Setup from '../../setup';
import Settings from '../../utils/settings';

export default class Resource {
  private _type: string;
  private _parentApi: string;
  protected _settings: Settings;
  protected _axiosInstance: AxiosInstance;
  protected _id: string;
  protected _api: string = '';
  protected _setup: Setup;

  public constructor(clientSession: ClientSession, type: string, id: string, parentApi: string) {
    this._axiosInstance = clientSession.getAxiosInstance();
    this._settings = clientSession.getSettings();
    this._setup = clientSession.getSetup();
    this._type = type;
    this._id = id;
    this._parentApi = parentApi;

    // Most child resources have standard api patterns: /api/<parent resource type>/{id}
    // But we can only assume this if both the 'id' and 'parent' are provided. In addition,
    // the extending class can simply choose to construct their own specialized api path
    // and do so in their own constructor functions.
    if (!_.isEmpty(id) && !_.isEmpty(parentApi)) {
      this._api = `${parentApi}/${id}`;
    }
  }

  //eslint-disable-next-line
  public async get(): Promise<any> {
    const { data: response } = await this._axiosInstance.get(this._api);
    return response;
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async update(body: { [key: string]: string }): Promise<any> {
    const { data: response } = await this._axiosInstance.put(this._api, body);

    return response;
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async delete(): Promise<void> {
    await this._axiosInstance.delete(this._api);
  }

  // This method should be overriden by the class extending `resource`
  // Delete the resource that was created
  protected async cleanup(): Promise<void> {}
}
