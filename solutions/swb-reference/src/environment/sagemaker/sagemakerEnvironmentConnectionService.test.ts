import SagemakerEnvironmentConnectionService from './sagemakerEnvironmentConnectionService';
describe('SagemakerEnvironmentConnectionService', () => {
  test('getAuthCreds should return mocked value', async () => {
    const sm = new SagemakerEnvironmentConnectionService();
    const instanceName = 'instance-abc123';
    await expect(sm.getAuthCreds(instanceName)).resolves.toEqual(
      `Get auth creds for instanceName ${instanceName}`
    );
  });

  test('getConnectionInstruction should return mocked value', async () => {
    const sm = new SagemakerEnvironmentConnectionService();
    await expect(sm.getConnectionInstruction()).resolves.toEqual('Connection instruction for Sagemaker');
  });
});
