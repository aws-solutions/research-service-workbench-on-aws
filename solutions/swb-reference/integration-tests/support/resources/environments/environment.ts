import ClientSession from '../../clientSession';
import Resource from '../base/resource';

class Environment extends Resource {
  public constructor(
    clientSession: ClientSession,
    defaultAdminSession: ClientSession,
    id: string,
    parentApi: string
  ) {
    super(clientSession, defaultAdminSession, 'environment', id, parentApi);
  }

  public async stopEnvironment(): Promise<void> {
    return this._axiosInstance.put(`${this._api}/stop`);
  }

  public async startEnvironment(): Promise<void> {
    return this._axiosInstance.put(`${this._api}/start`);
  }
}
