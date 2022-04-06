import SagemakerEnvironmentLifecycleService from './sagemakerEnvironmentLifecycleService';
describe('SagemakerEnvironmentLifecycleService', () => {
  test('Launch should return mocked id', async () => {
    const sm = new SagemakerEnvironmentLifecycleService();
    const response = await sm.launch({});
    expect(response).toEqual({ id: 'abc-1234' });
  });
  test('Terminate should not throw error', async () => {
    const sm = new SagemakerEnvironmentLifecycleService();
    await expect(sm.terminate('abc')).resolves.not.toThrowError();
  });
  test('Start should not throw error', async () => {
    const sm = new SagemakerEnvironmentLifecycleService();
    await expect(sm.start('abc')).resolves.not.toThrowError();
  });
  test('Stop should not throw error', async () => {
    const sm = new SagemakerEnvironmentLifecycleService();
    await expect(sm.stop('abc')).resolves.not.toThrowError();
  });
});
