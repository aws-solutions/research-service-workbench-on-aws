import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { SSMClient, StartAutomationExecutionCommand } from '@aws-sdk/client-ssm';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import EnvironmentLifecycleHelper, { Operation } from './environmentLifecycleHelper';

describe('EnvironmentLifecycleHelper', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.STACK_NAME = 'SWB_Main_Stack';
    process.env.MAIN_ACCOUNT_BUS_ARN_NAME = 'Main_Account_Bus_Arn_Output';
    process.env.SSM_DOC_NAME_SUFFIX = 'SSMDoc';
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
              OutputKey: process.env.MAIN_ACCOUNT_BUS_ARN_NAME,
              OutputValue: 'arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va'
            },
            {
              OutputKey: `SagemakerLaunch${process.env.SSM_DOC_NAME_SUFFIX}`,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerLaunch'
            },
            {
              OutputKey: `SagemakerTerminate${process.env.SSM_DOC_NAME_SUFFIX}`,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerTerminate'
            }
          ]
        }
      ]
    });
  }

  test('executeSSMDocument does not throw an error', async () => {
    // BUILD
    const stsMock = mockClient(STSClient);
    const ssmMock = mockClient(SSMClient);
    const cfnMock = mockClient(CloudFormationClient);
    // Mock Modify Doc Permission
    ssmMock.on(StartAutomationExecutionCommand).resolves({});
    // Mock Modify Doc Permission
    stsMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: 'sampleAccessKey',
        SecretAccessKey: 'sampleSecretAccessKey',
        SessionToken: 'blah',
        Expiration: undefined
      }
    });
    // Mock Cloudformation describeStacks
    mockCloudformationOutputs(cfnMock);
    const helper = new EnvironmentLifecycleHelper();
    const operation: Operation = 'Launch';
    const payload = {
      ssmParameters: {
        InstanceName: ['basicnotebookinstance-sampleInstanceName']
      },
      operation,
      envType: 'Sagemaker',
      accountId: '123456789012'
    };

    // EXECUTE & CHECK
    await expect(helper.executeSSMDocument(payload)).resolves.not.toThrowError();
  });

  test('storeToDdb does not throw an error', async () => {
    const helper = new EnvironmentLifecycleHelper();
    await expect(helper.storeToDdb({})).resolves.not.toThrowError();
  });

  test('getMainEventBusArn returns the expected OutputValue', async () => {
    // BUILD
    const cfnMock = mockClient(CloudFormationClient);
    // Mock Cloudformation describeStacks
    mockCloudformationOutputs(cfnMock);
    const helper = new EnvironmentLifecycleHelper();

    // EXECUTE
    const resultArn = await helper.getMainEventBusArn();

    // CHECK
    expect(resultArn).toBe('arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va');
  });
});
