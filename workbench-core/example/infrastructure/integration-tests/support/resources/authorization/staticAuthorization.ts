import { AxiosPromise } from 'axios';
import ClientSession from '../../clientSession';
import CollectionResource from '../base/collectionResource';

export class StaticAuthorization extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'staticAuthorization', '', '/staticAuthorization');
  }
  public async isAuthorizedOnRoute(params: Record<string, unknown>): Promise<AxiosPromise> {
    return this._axiosInstance.get(`${this._parentApi}/isAuthorizedOnRoute`, { params });
  }

  public async isRouteIgnored(params: Record<string, unknown>): Promise<AxiosPromise> {
    return this._axiosInstance.get(`${this._parentApi}/isRouteIgnored`, { params });
  }
}
