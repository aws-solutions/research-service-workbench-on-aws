import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { EventBridgeClient, PutPermissionCommand } from '@aws-sdk/client-eventbridge';
import { EC2Client, ModifyImageAttributeCommand } from '@aws-sdk/client-ec2';
import { SSMClient, ModifyDocumentPermissionCommand } from '@aws-sdk/client-ssm';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import HostingAccountLifecycleService from './hostingAccountLifecycleService';

const constants = {
  MAIN_ACCOUNT_BUS_ARN_NAME: 'SampleMainAccountBusArn',
  SAGEMAKER_LAUNCH_SSM_DOC: 'SagemakerLaunchSSMDocOutput'
};

describe('HostingAccountLifecycleService', () => {
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
              OutputKey: constants.MAIN_ACCOUNT_BUS_ARN_NAME,
              OutputValue: 'arn:aws:events:us-east-1:235778585540:event-bus/swb-swbv2-va'
            },
            {
              OutputKey: constants.SAGEMAKER_LAUNCH_SSM_DOC,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerLaunch'
            }
          ]
        }
      ]
    });
  }
  test('execute does not return an error', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService({
      AWS_REGION: 'us-east-1',
      STACK_NAME: 'swb-swbv2-va',
      SSM_DOC_NAME_SUFFIX: 'sampleSSMDocOutput',
      MAIN_ACCOUNT_BUS_ARN_NAME: 'SampleMainAccountBusArn',
      AMI_IDS_TO_SHARE: '[]'
    });

    const ebMock = mockClient(EventBridgeClient);
    const ec2Mock = mockClient(EC2Client);
    const ssmMock = mockClient(SSMClient);
    const cfnMock = mockClient(CloudFormationClient);

    // Mock Modify Doc Permission
    ssmMock.on(ModifyDocumentPermissionCommand).resolves({});

    // Mock Modify AMI permission attribute
    ec2Mock.on(ModifyImageAttributeCommand).resolves({});

    // Mock EventBridge put permission
    ebMock.on(PutPermissionCommand).resolves({});

    // Mock Cloudformation describeStacks
    mockCloudformationOutputs(cfnMock);

    await expect(
      hostingAccountLifecycleService.initializeAccount({
        accountId: '123456789012',
        envManagementRoleArn: 'sampleEnvManagementRoleArn',
        accountHandlerRoleArn: 'sampleAccountHandlerRoleArn'
      })
    ).resolves.not.toThrowError();
  });
});
