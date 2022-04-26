import { EnvironmentConnectionService } from '@amzn/environments';

export default class SagemakerEnvironmentConnectionService implements EnvironmentConnectionService {
  /**
   * Get credentials for connecting to the environment
   */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public getAuthCreds(instanceName: string, context?: any): Promise<any> {
    return Promise.resolve(`Get auth creds for instanceName ${instanceName}`);
  }

  /**
   * Instructions for connecting to the workspace that can be shown verbatim in the UI
   */
  public getConnectionInstruction(): Promise<string> {
    return Promise.resolve('Connection instruction for Sagemaker');
  }
}
