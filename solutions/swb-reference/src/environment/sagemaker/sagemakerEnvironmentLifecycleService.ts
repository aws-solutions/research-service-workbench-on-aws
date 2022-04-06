import { EnvironmentLifecycleService } from '@amzn/environments';

export default class SagemakerEnvironmentLifecycleService implements EnvironmentLifecycleService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async launch(envMetadata: any): Promise<{ id: string }> {
    /*
     TODO
      1.Assumes hosting account IAM role
      2.Execute SSM document to launch environment
    */
    console.log(`Called launch with envMetadata: ${JSON.stringify(envMetadata)}`);
    return Promise.resolve({ id: 'abc-1234' });
  }

  public async terminate(id: string): Promise<void> {
    /*
      TODO
       1.Assumes hosting account IAM role
       2.Execute SSM document to terminate
   */
    console.log(`Called terminate with id: ${id}`);
  }

  public async start(id: string): Promise<void> {
    /*
      TODO
       1. Assume hosting account IAM role
       2. Use SDK API to start instance
    */
    console.log(`Called start with id: ${id}`);
  }

  public async stop(id: string): Promise<void> {
    /*
      TODO
       1. Assume hosting account IAM role
       2. Use SDK API to stop instance
    */
    console.log(`Called stop with id: ${id}`);
  }
}
