jest.mock('uuid', () => ({
  v4: jest.fn()
}));
const mockUuid = require('uuid') as { v4: jest.Mock<string, []> };

import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { SSMClient, SendCommandCommand } from '@aws-sdk/client-ssm';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { ServiceCatalogClient, ListLaunchPathsCommand } from '@aws-sdk/client-service-catalog';
import { DynamoDBClient, UpdateItemCommand, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import SagemakerEnvironmentLifecycleService from './sagemakerEnvironmentLifecycleService';
describe('SagemakerEnvironmentLifecycleService', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.SSM_DOC_NAME_SUFFIX = 'SSMDocSampleSuffix';
    process.env.STACK_NAME = 'swb-swbv2-va';
    mockUuid.v4.mockImplementationOnce(() => 'sampleEnvId');
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
    const ddbMock = mockClient(DynamoDBClient);

    // Mock DDB
    ddbMock.on(UpdateItemCommand).resolves({});
    ddbMock.on(GetItemCommand).resolves({
      Item: {
        pk: {
          S: 'ACC#a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        sk: {
          S: 'ACC#a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        accountHandlerRoleArn: {
          S: 'arn:aws:iam::123456789012:role/swb-swbv2-va-cross-account-role'
        },
        accountId: {
          S: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        awsAccountId: {
          S: '123456789012'
        },
        cidr: {
          S: '1.1.1.1/32'
        },
        createdAt: {
          S: '2022-05-05T16:32:46.088Z'
        },
        encryptionKeyArn: {
          S: 'arn:aws:kms:us-east-1:123456789012:key/11267bce-04c4-414d-9c67-7a7db160b879'
        },
        environmentInstanceFiles: {
          S: 's3://swb-swbv2-va-s3artifacts6892ee6a-9lcfxw15wdh1/environment-files'
        },
        envManagementRoleArn: {
          S: 'arn:aws:iam::123456789012:role/swb-swbv2-va-env-mgmt'
        },
        eventBusArn: {
          S: 'arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va'
        },
        id: {
          S: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        resourceType: {
          S: 'account'
        },
        subnetId: {
          S: 'subnet-0bd8f38199152daa5'
        },
        updatedAt: {
          S: '2022-05-05T16:32:46.088Z'
        },
        vpcId: {
          S: 'vpc-0f7510b07d0b7504a'
        }
      }
    });

    ssmMock.on(SendCommandCommand).resolves({});
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
    const response = await sm.launch({ awsAccountId: '123456789012' });
    expect(response).toEqual({ envId: 'sampleEnvId', awsAccountId: '123456789012', status: 'PENDING' });
  });

  test('Launch triggered with envId should throw error', async () => {
    const sm = new SagemakerEnvironmentLifecycleService();
    await expect(sm.launch({ envId: 'hasntBeenCreatedYet' })).rejects.toThrowError(
      'envId cannot be passed in the request body when trying to launch a new environment'
    );
  });
  // test('Terminate should not throw error', async () => {
  //   const stsMock = mockClient(STSClient);
  //   const ssmMock = mockClient(SSMClient);
  //   const cfnMock = mockClient(CloudFormationClient);
  //   stsMock.on(AssumeRoleCommand).resolves({
  //     Credentials: {
  //       AccessKeyId: 'sampleAccessKey',
  //       SecretAccessKey: 'sampleSecretAccessKey',
  //       SessionToken: 'blah',
  //       Expiration: undefined
  //     }
  //   });
  //   // Mock Modify Doc Permission
  //   ssmMock.on(SendCommandCommand).resolves({});
  //   // Mock Cloudformation describeStacks
  //   mockCloudformationOutputs(cfnMock);
  //   const sm = new SagemakerEnvironmentLifecycleService();
  //   sm.helper.getHostEventBusArn = jest.fn().mockResolvedValue('arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va');
  //   const ddbMock = mockClient(DynamoDBClient);
  //   ddbMock.on(UpdateItemCommand).resolves({});
  //   ddbMock.on(GetItemCommand).resolves({
  //     Item: {
  //       pk: {
  //         S: 'ENV#6e185c8c-caeb-4305-8f08-d408b316dca7'
  //       },
  //       sk: {
  //         S: 'ENV#6e185c8c-caeb-4305-8f08-d408b316dca7'
  //       },
  //       accountId: {
  //         S: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f'
  //       },
  //       awsAccountId: {
  //         S: '123456789012'
  //       },
  //       createdAt: {
  //         S: '2022-05-05T19:39:03.023Z'
  //       },
  //       envTypeId: {
  //         S: 'prod-hxwmltpkg2edy-pa-fh6spfcycydtq'
  //       },
  //       id: {
  //         S: '6e185c8c-caeb-4305-8f08-d408b316dca7'
  //       },
  //       resourceType: {
  //         S: 'environment'
  //       },
  //       provisionedProductId: {
  //         S: 'blah'
  //       },
  //       status: {
  //         N: '1'
  //       },
  //       updatedAt: {
  //         S: '2022-05-05T19:43:57.143Z'
  //       }
  //     }
  //   });

  //   await expect(sm.terminate('sampleEnvId')).resolves.not.toThrowError();
  // });

  test('Start should not throw error', async () => {
    const sm = new SagemakerEnvironmentLifecycleService();
    const stsMock = mockClient(STSClient);
    const ssmMock = mockClient(SSMClient);
    ssmMock.on(SendCommandCommand).resolves({});
    stsMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: 'sampleAccessKey',
        SecretAccessKey: 'sampleSecretAccessKey',
        SessionToken: 'blah',
        Expiration: undefined
      }
    });
    const ddbMock = mockClient(DynamoDBClient);
    ddbMock.on(UpdateItemCommand).resolves({});
    ddbMock.on(QueryCommand).resolves({
      Items: [
        {
          pk: {
            S: 'ENV#dd0eec4b-1f2b-4bc1-9dac-34a164c67618'
          },
          sk: {
            S: 'INID#BasicNotebookInstance-JMXl7uofi4i0'
          },
          createdAt: {
            S: '2022-05-06T05:22:13.781Z'
          },
          id: {
            S: 'dd0eec4b-1f2b-4bc1-9dac-34a164c67618'
          },
          instanceArn: {
            S: 'arn:aws:sagemaker:us-east-1:123456789012:notebook-instance/basicnotebookinstance-jmxl7uofi4i0'
          },
          updatedAt: {
            S: '2022-05-06T05:22:13.781Z'
          }
        }
      ]
    });
    ddbMock.on(GetItemCommand).resolves({
      Item: {
        pk: {
          S: 'ACC#a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        sk: {
          S: 'ACC#a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        accountHandlerRoleArn: {
          S: 'arn:aws:iam::123456789012:role/swb-swbv2-va-cross-account-role'
        },
        accountId: {
          S: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        awsAccountId: {
          S: '123456789012'
        },
        cidr: {
          S: '1.1.1.1/32'
        },
        createdAt: {
          S: '2022-05-05T16:32:46.088Z'
        },
        encryptionKeyArn: {
          S: 'arn:aws:kms:us-east-1:123456789012:key/11267bce-04c4-414d-9c67-7a7db160b879'
        },
        environmentInstanceFiles: {
          S: 's3://swb-swbv2-va-s3artifacts6892ee6a-9lcfxw15wdh1/environment-files'
        },
        envManagementRoleArn: {
          S: 'arn:aws:iam::123456789012:role/swb-swbv2-va-env-mgmt'
        },
        eventBusArn: {
          S: 'arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va'
        },
        id: {
          S: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        resourceType: {
          S: 'account'
        },
        subnetId: {
          S: 'subnet-0bd8f38199152daa5'
        },
        updatedAt: {
          S: '2022-05-06T05:30:53.175Z'
        },
        vpcId: {
          S: 'vpc-0f7510b07d0b7504a'
        }
      }
    });

    await expect(sm.start('sampleEnvId')).resolves.not.toThrowError();
  });
  test('Stop should not throw error', async () => {
    const sm = new SagemakerEnvironmentLifecycleService();
    const stsMock = mockClient(STSClient);
    const ssmMock = mockClient(SSMClient);
    ssmMock.on(SendCommandCommand).resolves({});
    stsMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: 'sampleAccessKey',
        SecretAccessKey: 'sampleSecretAccessKey',
        SessionToken: 'blah',
        Expiration: undefined
      }
    });
    const ddbMock = mockClient(DynamoDBClient);
    ddbMock.on(UpdateItemCommand).resolves({});
    ddbMock.on(QueryCommand).resolves({
      Items: [
        {
          pk: {
            S: 'ENV#dd0eec4b-1f2b-4bc1-9dac-34a164c67618'
          },
          sk: {
            S: 'INID#BasicNotebookInstance-JMXl7uofi4i0'
          },
          createdAt: {
            S: '2022-05-06T05:22:13.781Z'
          },
          id: {
            S: 'dd0eec4b-1f2b-4bc1-9dac-34a164c67618'
          },
          instanceArn: {
            S: 'arn:aws:sagemaker:us-east-1:123456789012:notebook-instance/basicnotebookinstance-jmxl7uofi4i0'
          },
          updatedAt: {
            S: '2022-05-06T05:22:13.781Z'
          }
        }
      ]
    });
    ddbMock.on(GetItemCommand).resolves({
      Item: {
        pk: {
          S: 'ACC#a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        sk: {
          S: 'ACC#a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        accountHandlerRoleArn: {
          S: 'arn:aws:iam::123456789012:role/swb-swbv2-va-cross-account-role'
        },
        accountId: {
          S: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        awsAccountId: {
          S: '123456789012'
        },
        cidr: {
          S: '1.1.1.1/32'
        },
        createdAt: {
          S: '2022-05-05T16:32:46.088Z'
        },
        encryptionKeyArn: {
          S: 'arn:aws:kms:us-east-1:123456789012:key/11267bce-04c4-414d-9c67-7a7db160b879'
        },
        environmentInstanceFiles: {
          S: 's3://swb-swbv2-va-s3artifacts6892ee6a-9lcfxw15wdh1/environment-files'
        },
        envManagementRoleArn: {
          S: 'arn:aws:iam::123456789012:role/swb-swbv2-va-env-mgmt'
        },
        eventBusArn: {
          S: 'arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va'
        },
        id: {
          S: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        resourceType: {
          S: 'account'
        },
        subnetId: {
          S: 'subnet-0bd8f38199152daa5'
        },
        updatedAt: {
          S: '2022-05-06T05:30:53.175Z'
        },
        vpcId: {
          S: 'vpc-0f7510b07d0b7504a'
        }
      }
    });

    await expect(sm.stop('sampleEnvId')).resolves.not.toThrowError();
  });
});
