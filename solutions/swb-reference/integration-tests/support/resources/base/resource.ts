import { AxiosInstance } from 'axios';
import _ from 'lodash';
import ClientSession from '../../clientSession';
import Setup from '../../setup';
import Settings from '../../utils/settings';
import { doCall, sleep } from '../../utils/utilities';

export default class Resource {
  protected _axiosInstance: AxiosInstance;
  private _settings: Settings;
  private _type: string;
  protected _id: string;
  private _parentApi: string;
  protected _api: string = '';
  // Specifies the delay duration in milliseconds needed to minimize the usage of stale data due to eventual
  // consistency.
  protected _deflakeDelayInMs: number = 2000;
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
    return doCall(async () => this._axiosInstance.get(this._api));
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async update(body: { [key: string]: string }): Promise<any> {
    const response = await doCall(async () => this._axiosInstance.put(this._api, body));

    await sleep(this._deflakeDelayInMs);
    return response;
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async delete(): Promise<void> {
    const response = await doCall(async () => this._axiosInstance.delete(this._api));

    await sleep(this._deflakeDelayInMs);
    return response;
  }

  // This method should be overriden by the class extending `resource`
  // Delete the resource that was created
  protected async cleanup(): Promise<void> {}
}
