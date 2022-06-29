import { EnvironmentStatus } from '@amzn/environments';
import ClientSession from '../../clientSession';
import { sleep } from '../../utils/utilities';
import Resource from '../base/resource';

export default class Environment extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'environment', id, parentApi);
  }

  public async stopEnvironment(): Promise<void> {
    return this._axiosInstance.put(`${this._api}/stop`);
  }

  public async startEnvironment(): Promise<void> {
    return this._axiosInstance.put(`${this._api}/start`);
  }

  protected async cleanup(): Promise<void> {
    const defAdminSession = await this._setup.getDefaultAdminSession();
    const maxWaitTimeInSeconds = 600;
    const startTimeInMs = Date.now();
    let totalTimeWaitedInSeconds = 0;

    let envStatus: EnvironmentStatus = 'PENDING';
    while (envStatus === 'PENDING' && totalTimeWaitedInSeconds < maxWaitTimeInSeconds) {
      await sleep(15000);
      const resource = await defAdminSession.resources.environments.environment(this._id).get();
      envStatus = resource.status;
      totalTimeWaitedInSeconds = (Date.now() - startTimeInMs) / 1000;
      console.log(
        `Cleanup for environments. Trying to delete env ${this._id}. Current env status is "${envStatus}". Waiting till environment is in valid state for deleting. Total waited time so far is ${totalTimeWaitedInSeconds} seconds`
      );
    }
    await defAdminSession.resources.environments.environment(this._id).delete();
    console.log(`Deleted environment ${this._id}`);
  }
}
