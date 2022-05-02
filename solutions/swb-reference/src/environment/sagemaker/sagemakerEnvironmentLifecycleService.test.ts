import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { SSMClient, SendCommandCommand } from '@aws-sdk/client-ssm';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { ServiceCatalogClient, ListLaunchPathsCommand } from '@aws-sdk/client-service-catalog';
import SagemakerEnvironmentLifecycleService from './sagemakerEnvironmentLifecycleService';
describe('SagemakerEnvironmentLifecycleService', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.SSM_DOC_NAME_SUFFIX = 'SSMDocSampleSuffix';
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mockCloudformationOutputs(cfMock: AwsStub<any, any>): void {
    cfMock.on(DescribeStacksCommand).resolves({
      Stacks: [
        {
          StackName: 'swb-swbv2-va',
          StackStatus: 'CREATE_COMPLETE',
          CreationTime: new Date(),
          Outputs: [
            {
              OutputKey: `SagemakerLaunch${process.env.SSM_DOC_NAME_SUFFIX}`,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerLaunch'
            },
            {
              OutputKey: `SagemakerTerminate${process.env.SSM_DOC_NAME_SUFFIX}`,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerTerminate'
            },
            {
              OutputKey: `SagemakerStart${process.env.SSM_DOC_NAME_SUFFIX}`,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerStart'
            },
            {
              OutputKey: `SagemakerStop${process.env.SSM_DOC_NAME_SUFFIX}`,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerStop'
            }
          ]
        }
      ]
    });
  }

  test('Launch should return mocked id', async () => {
    const stsMock = mockClient(STSClient);
    const ssmMock = mockClient(SSMClient);
    const cfnMock = mockClient(CloudFormationClient);
    const scMock = mockClient(ServiceCatalogClient);
    // Mock Modify Doc Permission
    ssmMock.on(SendCommandCommand).resolves({});
    // Mock Modify Doc Permission
    stsMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: 'sampleAccessKey',
        SecretAccessKey: 'sampleSecretAccessKey',
        SessionToken: 'blah',
        Expiration: undefined
      }
    });
    scMock.on(ListLaunchPathsCommand).resolves({
      LaunchPathSummaries: [
        {
          Id: 'mockedLaunchPathId'
        }
      ]
    });
    // Mock Cloudformation describeStacks
    mockCloudformationOutputs(cfnMock);

    const sm = new SagemakerEnvironmentLifecycleService();
    const response = await sm.launch({ accountId: '123456789012' });
    expect(response).toEqual({ envId: 'sampleEnvId' });
  });
  test('Launch triggered with envId should throw error', async () => {
    const sm = new SagemakerEnvironmentLifecycleService();
    await expect(sm.launch({ envId: 'hasntBeenCreatedYet' })).rejects.toThrowError(
      'envId cannot be passed in the request body when trying to launch a new environment'
    );
  });
  test('Terminate should not throw error', async () => {
    const ssmMock = mockClient(SSMClient);
    const cfnMock = mockClient(CloudFormationClient);
    // Mock Modify Doc Permission
    ssmMock.on(SendCommandCommand).resolves({});
    // Mock Cloudformation describeStacks
    mockCloudformationOutputs(cfnMock);

    const sm = new SagemakerEnvironmentLifecycleService();
    await expect(sm.terminate('testEnvId')).resolves.not.toThrowError();
  });
  test('Start should not throw error', async () => {
    const sm = new SagemakerEnvironmentLifecycleService();
    await expect(sm.start('testEnvId')).resolves.not.toThrowError();
  });
  test('Stop should not throw error', async () => {
    const sm = new SagemakerEnvironmentLifecycleService();
    await expect(sm.stop('testEnvId')).resolves.not.toThrowError();
  });
});
