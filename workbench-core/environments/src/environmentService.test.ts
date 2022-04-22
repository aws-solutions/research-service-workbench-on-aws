import EnvironmentService from './environmentService';

describe('EnvironmentService', () => {
  test('getEnvironment', async () => {
    const environmentService = new EnvironmentService({
      AWS_REGION: 'us-east-1',
      TABLE_NAME: 'swb-dev1-va-table'
    });
    const data = await environmentService.getEnvironment('1234-test');
  });
  // test('getEnvironments does not return an error', async () => {
  //   const environmentService = new EnvironmentService({AWS_REGION: 'us-east-1',TABLE_NAME: 'swb-dev1-va-table'});
  //   const data = await environmentService.getEnvironments();
  //   // console.log(data.Items);
  //   await expect(environmentService.getEnvironments()).resolves.not.toThrowError();
  // });
  // test('getEnvironmentAndMetadata does not return an error', async () => {
  //   const environmentService = new EnvironmentService({AWS_REGION: 'us-east-1',TABLE_NAME: 'swb-dev1-va-table'});
  //   const data = await environmentService.getEnvironmentAndMetadata('TEST');
  //   // console.log(data.Items);
  //   await expect(environmentService.getEnvironmentAndMetadata('TEST')).resolves.not.toThrowError();
  // });
  // test('getEnvironment does not return an error', async () => {
  //   const environmentService = new EnvironmentService({AWS_REGION: 'us-east-1',TABLE_NAME: 'swb-dev1-va-table'});
  //   const data = await environmentService.getEnvironment('TEST1');
  //   // console.log(data);
  //   await expect(environmentService.getEnvironment('TEST1')).resolves.not.toThrowError();
  // });
  // // test('getMultipleEnvironment does not return an error', async () => {
  // //   const environmentService = new EnvironmentService({AWS_REGION: 'us-east-1',TABLE_NAME: 'swb-dev1-va-table'});
  // //   const data = await environmentService.getMultipleEnvironments(['TEST', 'TEST1']);
  // //   // console.log(data);
  // //   await expect(environmentService.getMultipleEnvironments(['TEST', 'TEST1'])).resolves.not.toThrowError();
  // // });
  // test('updateEnvironment does not return an error', async () => {
  //   const environmentService = new EnvironmentService({AWS_REGION: 'us-east-1', TABLE_NAME: 'swb-dev1-va-table'});
  //   const data = await environmentService.updateEnvironment('TEST1', {'mutable': {S: 'someOtherValueAgain'}});
  //   console.log(data);
  //   await expect(environmentService.updateEnvironment('TEST1', {'mutable': {S: 'someOtherValueAgain'}})).resolves.not.toThrowError();
  // });
  // test('deleteEnvironment does not return an error', async () => {
  //   const environmentService = new EnvironmentService({AWS_REGION: 'us-east-1', TABLE_NAME: 'swb-dev1-va-table'});
  //   const data = await environmentService.updateEnvironment('TEST_TO_DELETE', {'toDelete': {S: 'yes'}});
  //   console.log(data);
  //   await expect(environmentService.updateEnvironment('TEST_TO_DELETE', {'toDelete': {S: 'yes'}})).resolves.not.toThrowError();
  //   const dataDeleted = await environmentService.deleteEnvironment('TEST_TO_DELETE');
  //   console.log(dataDeleted);
  //   await expect(environmentService.deleteEnvironment('TEST_TO_DELETE')).resolves.not.toThrowError();
  // });
  // test('deleteEnvironmentAndMetadata does not return an error', async () => {
  //   const environmentService = new EnvironmentService({AWS_REGION: 'us-east-1', TABLE_NAME: 'swb-dev1-va-table'});
  //   await environmentService.addEnvironmentAndMetadata('TEST1',
  //     'test environment',
  //     'test-env-1234',
  //     'project01',
  //     [],
  //     'Ec2 Linux',
  //     'pa-1234-test-prod-1234',
  //     'pa-1234-test-prod-1234-pp-test',
  //     'index01',
  //     {'pk': {S: 'ACC#1234'}, 'sk': {S: 'ACC#1234'}, 'id': {S: '1234'}, 'roleArn': {S: 'sample-role-arn'}});
  //   // const data = await environmentService.deleteEnvironmentAndMetadata('ENV#TEST1');
  //   // console.log(data);
  //   await expect(environmentService.deleteEnvironmentAndMetadata('ENV#TEST1')).resolves.not.toThrowError();
  // })
  // test('addEnvironmentAndMetadata does not return an error', async () => {
  //   const environmentService = new EnvironmentService({AWS_REGION: 'us-east-1', TABLE_NAME: 'swb-dev1-va-table'});
  //   // const data = await environmentService.addEnvironmentAndMetadata('1234-test',
  //   //   'test environment',
  //   //   'test-env-1234',
  //   //   'project01',
  //   //   [],
  //   //   'Ec2 Linux',
  //   //   'pa-1234-test-prod-1234',
  //   //   'pa-1234-test-prod-1234-pp-test',
  //   //   'index01',
  //   //   {'pk': {S: 'ACC#1234'}, 'sk': {S: 'ACC#1234'}, 'id': {S: '1234'}, 'roleArn': {S: 'sample-role-arn'}});
  //   // console.log(data);
  //   await expect(environmentService.addEnvironmentAndMetadata('1234-test',
  //   'test environment',
  //   'test-env-1234',
  //   'project01',
  //   [],
  //   'Ec2 Linux',
  //   'pa-1234-test-prod-1234',
  //   'pa-1234-test-prod-1234-pp-test',
  //   'index01',
  //   {'pk': {S: 'ACC#1234'}, 'sk': {S: 'ACC#1234'}, 'id': {S: '1234'}, 'roleArn': {S: 'sample-role-arn'}})).resolves.not.toThrowError();
  // })
});
