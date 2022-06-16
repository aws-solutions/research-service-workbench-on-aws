import EnvironmentTypeService from './environmentTypeService';

describe('environmentTypeService', () => {
  const TABLE_NAME = 'swb-dev2-can';
  beforeAll(() => {
    process.env.AWS_REGION = 'ca-central-1';
  });
  test('foo', () => {
    expect(true).toEqual(true);
  });
  const envTypeId = 'e7a9f588-105b-4f22-a7b9-182f29c49446';
  // test('get an environmentTypeService', async () => {
  //   const envTypeService = new EnvironmentTypeService({ TABLE_NAME });
  //   const data = await envTypeService.getEnvironmentType(envTypeId);
  //   console.log('data', data);
  // });

  // test('get environmentTypes', async () => {
  //   const envTypeService = new EnvironmentTypeService({ TABLE_NAME });
  //   const data = await envTypeService.getEnvironmentTypes();
  //   console.log('data', data);
  // });
  //
  // test('update an environment', async () => {
  //   const envTypeService = new EnvironmentTypeService({ TABLE_NAME });
  //   const data = await envTypeService.updateEnvironment(envTypeId, 'owner-123', {
  //     status: 'APPROVED'
  //   });
  //   console.log('data', data);
  // });

  // test('create an environment', async () => {
  //   const envTypeService = new EnvironmentTypeService({ TABLE_NAME });
  //   const data = await envTypeService.createNewEnvironment({
  //     productId: 'prod-77ncg2cb3bx4g',
  //     provisioningArtifactId: 'pa-hs4ex4okpbl7e',
  //     description: 'An Amazon SageMaker Jupyter Notebook second env',
  //     name: 'Jupyter Notebook',
  //     owner: 'owner-123',
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
  //       },
  //       {
  //         DefaultValue: '1.1.1.1/1',
  //         Description: 'CIDR to restrict IPs that can access the environment',
  //         IsNoEcho: false,
  //         ParameterConstraints: {
  //           AllowedValues: []
  //         },
  //         ParameterKey: 'CIDR',
  //         ParameterType: 'String'
  //       }
  //     ],
  //     status: 'NOT_APPROVED'
  //   });
  //   console.log('data', data);
  // });
});
