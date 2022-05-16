/* eslint-disable */
import EnvironmentService from './environmentService';

describe('EnvironmentService', () => {
  const TABLE_NAME = 'swb-dev1-va';
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-1';
  });
  test('getEnvironment, includeMetadata = true', async () => {
    const environmentService = new EnvironmentService({
      TABLE_NAME
    });
    const data = await environmentService.getEnvironment('1234-test', true);
    console.log('data', data);
  });
  test('getEnvironment, includeMetadata = false', async () => {
    const environmentService = new EnvironmentService({
      TABLE_NAME
    });
    const data = await environmentService.getEnvironment('1234-test', false);
    console.log('data', data);
  });
  test('getEnvironments as admin', async () => {
    const environmentService = new EnvironmentService({ TABLE_NAME });
    const data = await environmentService.getEnvironments({ role: 'admin', ownerId: 'abc' });
    console.log('data', data);
  });
  test('getEnvironments as admin, filtered by pending', async () => {
    const environmentService = new EnvironmentService({ TABLE_NAME });
    const data = await environmentService.getEnvironments(
      { role: 'admin', ownerId: 'abc' },
      {
        status: 'PENDING'
      }
    );
    console.log('data', data);
  });
  test('createEnvironment', async () => {
    const environmentService = new EnvironmentService({ TABLE_NAME });
    const data = await environmentService.createEnv({
      instance: 'instance-123',
      cidr: '0.0.0.0/0',
      description: 'test 123',
      error: undefined,
      name: 'testEnv',
      outputs: [],
      envTypeId: 'envType-123',
      envTypeConfigId: 'envTypeConfig-123',
      projectId: 'proj-123',
      // studyIds: ['study-123'],
      studyIds: [],
      status: 'PENDING'
    });
    console.log('data', data);
  });

  test('foo', () => {
    const studies = [1, 2];
  });
  // test('updateEnvironment does not return an error', async () => {
  //   const environmentService = new EnvironmentService({AWS_REGION: 'us-east-1', TABLE_NAME: 'swb-dev1-va-table'});
  //   const data = await environmentService.updateEnvironment('TEST1', {'mutable': {S: 'someOtherValueAgain'}});
  //   console.log(data);
  //   await expect(environmentService.updateEnvironment('TEST1', {'mutable': {S: 'someOtherValueAgain'}})).resolves.not.toThrowError();
  // });
  // test('addEnvironmentAndMetadata does not return an error', async () => {
  //   const environmentService = new EnvironmentService({
  //     TABLE_NAME: 'swb-dev-oh'
  //   });
  //   const data = await environmentService.addEnvironmentAndMetadata(
  //     '1234-test',
  //     'test environment',
  //     'test-env-1234',
  //     'project01',
  //     [],
  //     'Ec2 Linux',
  //     'envType1',
  //     'envTypeConfig1',
  //     'index01',
  //     { pk: { S: 'ACC#1234' }, sk: { S: 'ACC#1234' }, id: { S: '1234' }, roleArn: { S: 'sample-role-arn' } }
  //   );
  //   console.log(data);
  //   await expect(
  //     environmentService.addEnvironmentAndMetadata(
  //       '1234-test',
  //       'test environment',
  //       'test-env-1234',
  //       'project01',
  //       [],
  //       'Ec2 Linux',
  //       'envType1',
  //       'envTypeConfig1',
  //       'index01',
  //       { pk: { S: 'ACC#1234' }, sk: { S: 'ACC#1234' }, id: { S: '1234' }, roleArn: { S: 'sample-role-arn' } }
  //     )
  //   ).resolves.not.toThrowError();
  // });
});
