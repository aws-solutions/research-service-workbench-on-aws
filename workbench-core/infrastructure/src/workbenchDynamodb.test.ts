/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttributeType, BillingMode, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { Function, InlineCode, Runtime } from 'aws-cdk-lib/aws-lambda';
import { WorkbenchDynamodb } from './workbenchDynamodb';
import { WorkbenchEncryptionKeyWithRotation } from './workbenchEncryptionKeyWithRotation';

describe('workbenchDynamodb Test', () => {
  test('default values', () => {
    const stack = new Stack();

    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodbTable', {
      partitionKey: { name: 'pk', type: AttributeType.STRING }
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      BillingMode: 'PAY_PER_REQUEST',
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true
      },
      SSESpecification: {
        SSEEnabled: true,
        SSEType: 'KMS'
      }
    });
  });

  test('should set the BillingMode to Provisioned', () => {
    const stack = new Stack();

    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodbTable', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });
  });

  test('point in time recovery should always be enabled', () => {
    const stack = new Stack();

    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodbTable', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      pointInTimeRecovery: false
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true
      }
    });
  });

  test('should use custom encryption key', () => {
    const stack = new Stack();

    const testEncryptionKey = new WorkbenchEncryptionKeyWithRotation(stack, 'Test-EncryptionKey');
    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodbTable', {
      partitionKey: { name: 'sk', type: AttributeType.STRING },
      encryptionKey: testEncryptionKey.key
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      SSESpecification: {
        KMSMasterKeyId: {
          'Fn::GetAtt': ['TestEncryptionKeyTestEncryptionKeyKey5573500C', 'Arn']
        },
        SSEEnabled: true,
        SSEType: 'KMS'
      }
    });
  });

  test('test replicationRegion param', () => {
    const stack = new Stack();

    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodbTable', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      encryption: TableEncryption.AWS_MANAGED,
      replicationRegions: ['us-east-1', 'us-east-2']
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      SSESpecification: {
        SSEEnabled: true
      },
      StreamSpecification: {
        StreamViewType: 'NEW_AND_OLD_IMAGES'
      }
    });
  });

  test('should create GSI', () => {
    const stack = new Stack();

    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodbTable', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      gsis: [
        {
          indexName: 'testGSI',
          partitionKey: { name: 'testPartitionKey', type: AttributeType.STRING },
          sortKey: { name: 'testSortKey', type: AttributeType.STRING }
        }
      ]
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      GlobalSecondaryIndexes: [
        {
          IndexName: 'testGSI',
          KeySchema: [
            {
              AttributeName: 'testPartitionKey',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'testSortKey',
              KeyType: 'RANGE'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          }
        }
      ]
    });
  });

  test('test replicationRegion param', () => {
    const stack = new Stack();

    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodbTable', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      encryption: TableEncryption.AWS_MANAGED,
      replicationRegions: ['us-east-1', 'us-east-2']
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      SSESpecification: {
        SSEEnabled: true
      },
      StreamSpecification: {
        StreamViewType: 'NEW_AND_OLD_IMAGES'
      }
    });
  });

  test('should grantLambda permissions', () => {
    const stack = new Stack();

    const lambda = new Function(stack, 'TestLambda', {
      runtime: Runtime.NODEJS_18_X,
      code: new InlineCode('foo'),
      handler: 'index.handler'
    });

    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodbTable', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      lambdas: [lambda]
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: [
              'kms:Decrypt',
              'kms:DescribeKey',
              'kms:Encrypt',
              'kms:ReEncrypt*',
              'kms:GenerateDataKey*'
            ],
            Effect: 'Allow',
            Resource: {
              'Fn::GetAtt': [
                'TestDynamodbTableTestDynamodbTableEncryptionKeyTestDynamodbTableEncryptionKeyKeyEE2AC39B',
                'Arn'
              ]
            }
          },
          {
            Action: [
              'dynamodb:BatchGetItem',
              'dynamodb:GetRecords',
              'dynamodb:GetShardIterator',
              'dynamodb:Query',
              'dynamodb:GetItem',
              'dynamodb:Scan',
              'dynamodb:ConditionCheckItem',
              'dynamodb:BatchWriteItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
              'dynamodb:DescribeTable'
            ],
            Effect: 'Allow',
            Resource: [
              {
                'Fn::GetAtt': ['TestDynamodbTable3EADD5C2', 'Arn']
              },
              {
                Ref: 'AWS::NoValue'
              }
            ]
          }
        ]
      }
    });
  });
});
