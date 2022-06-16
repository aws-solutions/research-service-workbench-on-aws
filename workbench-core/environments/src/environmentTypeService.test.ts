import EnvironmentTypeService from './environmentTypeService';

describe('environmentTypeService', () => {
  const TABLE_NAME = 'swb-dev-oh';
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-2';
  });
  test('foo', () => {
    expect(true).toEqual(true);
  });
  // const envTypeId = 'fc67af91-c127-4139-a78d-ee0199ab63a8';
  // test('get an environmentTypeService', async () => {
  //   const envTypeService = new EnvironmentTypeService({ TABLE_NAME });
  //   const data = await envTypeService.getEnvironmentType(envTypeId);
  //   console.log('data', data);
  // });
  //
  // test('get environmentTypes', async () => {
  //   const envTypeService = new EnvironmentTypeService({ TABLE_NAME });
  //   const data = await envTypeService.getEnvironmentTypes();
  //   console.log('data', data);
  // });
  //
  // test('update an environment', async () => {
  //   const envTypeService = new EnvironmentTypeService({ TABLE_NAME });
  //   const data = await envTypeService.updateEnvironment('zzz', {
  //     status: 'pending'
  //   });
  //   console.log('data', data);
  // });
  //
  // test('create an environment', async () => {
  //   const envTypeService = new EnvironmentTypeService({ TABLE_NAME });
  //   const data = await envTypeService.createNewEnvironment({
  //     productId: 'prod-t5q2vqlgvd76o',
  //     provisioningArtifactId: 'pa-3cwcuxmksf2xy',
  //     createdAt: '2022-02-03T20:06:45.428Z',
  //     createdBy: 'u-HJtc1fiQnF5XNmrIu6KLU',
  //     desc: 'An Amazon SageMaker Jupyter Notebook',
  //     name: 'Jupyter Notebook',
  //     owner: 'u-HJtc1fiQnF5XNmrIu6KLU',
  //     type: 'sagemaker',
  //     params: [
  //       {
  //         DefaultValue: 'ml.t3.xlarge',
  //         Description: 'EC2 instance type to launch',
  //         IsNoEcho: false,
  //         ParameterConstraints: {
  //           AllowedValues: []
  //         },
  //         ParameterKey: 'InstanceType',
  //         ParameterType: 'String'
  //       },
  //       {
  //         Description:
  //           'Number of idle minutes for auto stop to shutdown the instance (0 to disable auto-stop)',
  //         IsNoEcho: false,
  //         ParameterConstraints: {
  //           AllowedValues: []
  //         },
  //         ParameterKey: 'AutoStopIdleTimeInMinutes',
  //         ParameterType: 'Number'
  //       },
  //       {
  //         Description: 'The IAM policy to be associated with the launched workstation',
  //         IsNoEcho: false,
  //         ParameterConstraints: {
  //           AllowedValues: []
  //         },
  //         ParameterKey: 'IamPolicyDocument',
  //         ParameterType: 'String'
  //       }
  //     ],
  //     resourceType: 'envType',
  //     status: 'approved',
  //     updatedAt: '2022-02-03T20:07:56.697Z',
  //     updatedBy: 'u-HJtc1fiQnF5XNmrIu6KLU'
  //   });
  //   console.log('data', data);
  // });
});
