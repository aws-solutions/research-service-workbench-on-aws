export default interface EnvironmentConnectionService {
  /**
   * Get credentials for connecting to the environment
   */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  getAuthCreds(instanceName: string, context?: any): Promise<any>;

  /**
   * Instructions for connecting to the workspace that can be shown verbatim in the UI
   */
  // TODO: Figure out the correct parameters for this method
  getConnectionInstruction(): Promise<string>;
}
