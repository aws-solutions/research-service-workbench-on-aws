import { JSONValue } from '@aws/workbench-core-base';
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';

export default class RouteProtection extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'routesProtection', '', 'authorization');
    this._api = `${this._parentApi}/routes`;
  }

  public async isRouteProtected(bodyParams?: Record<string, string>): Promise<AxiosResponse> {
    return this._axiosInstance.get(`${this._api}/protected`, { params: bodyParams });
  }

  public async isRouteIgnored(bodyParams?: Record<string, JSONValue>): Promise<AxiosResponse> {
    return this._axiosInstance.get(`${this._api}/ignored`, { params: bodyParams });
  }
}
