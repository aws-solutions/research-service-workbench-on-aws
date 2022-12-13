/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttributeType, BillingMode, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { WorkbenchDynamodb } from './workbenchDynamodb';
import { WorkbenchEncryptionKeyWithRotation } from './workbenchEncryptionKeyWithRotation';

describe('workbenchDynamodb Test', () => {
  test('default values', () => {
    const stack = new Stack();

    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodb', {
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
    new WorkbenchDynamodb(stack, 'TestDynamodb', {
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

  test('should always use Custom Managed Keys', () => {
    const stack = new Stack();

    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodb', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      encryption: TableEncryption.AWS_MANAGED
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      SSESpecification: {
        SSEEnabled: true,
        SSEType: 'KMS'
      }
    });
  });

  test('point in time recovery should always be enabled', () => {
    const stack = new Stack();

    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodb', {
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

  test('use custom encryption key', () => {
    const stack = new Stack();

    const encryptionKey = new WorkbenchEncryptionKeyWithRotation(stack, 'test-EncryptionKey');
    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodb', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      encryptionKey: encryptionKey.key
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      SSESpecification: {
        KMSMasterKeyId: {
          'Fn::GetAtt': ['testEncryptionKeytestEncryptionKeyKey2FA1432D', 'Arn']
        },
        SSEEnabled: true,
        SSEType: 'KMS'
      }
    });
  });
});
