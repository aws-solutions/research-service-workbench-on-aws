// eslint-disable-next-line @typescript-eslint/naming-convention
export default interface EnvironmentLifecycleService {
  /**
   * Launching an instance
   *
   * Return: DDB Env id
   */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  launch(envMetadata: any): Promise<{ id: string }>;

  /**
   * Terminate an instance
   */
  terminate(id: string): Promise<void>;

  /**
   * Start an instance
   */
  start(id: string): Promise<void>;

  /**
   * Stop an instance
   */
  stop(id: string): Promise<void>;
}
