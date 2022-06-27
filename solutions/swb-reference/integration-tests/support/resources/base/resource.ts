import { AxiosInstance } from 'axios';
import _ from 'lodash';
import ClientSession from '../../clientSession';
import Settings from '../../utils/settings';

export default class Resource {
  protected _axiosInstance: AxiosInstance;
  private _defaultAdminSession: ClientSession;
  private _settings: Settings;
  private _type: string;
  private _id: string;
  private _parentApi: string;
  protected _api: string = '';

  public constructor(
    clientSession: ClientSession,
    defaultAdminSession: ClientSession,
    type: string,
    id: string,
    parentApi: string
  ) {
    this._defaultAdminSession = defaultAdminSession;
    this._axiosInstance = clientSession.getAxiosInstance();
    this._settings = clientSession.getSettings();
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
  public async get(queryParams: { [key: string]: string }): Promise<any> {
    return this._doCall(async () => this._axiosInstance.get(this._api, { params: queryParams }));
  }

  // We wrap the call to axios so that we can capture the boom code and payload attributes passed from the
  // server
  // eslint-disable-next-line
  private async _doCall(fn: Function): Promise<any> {
    try {
      const response = await fn();
      return _.get(response, 'data');
    } catch (error) {
      console.log('Error is', error);
    }
  }
}
