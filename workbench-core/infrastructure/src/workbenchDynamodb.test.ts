import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { EncryptionKeyWithRotation } from './encryptionKeyWithRotation';
import { WorkbenchDynamodb } from './workbenchDynamodb';

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
      }
    });
  });

  test('custom values', () => {
    const stack = new Stack();
    const encryptionKey = new EncryptionKeyWithRotation(stack, 'TestDynamodb-EncryptionKey', {
      removalPolicy: RemovalPolicy.DESTROY
    });

    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(stack, 'TestDynamodb', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED,
      pointInTimeRecovery: false,
      encryptionKey: encryptionKey.key
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: false
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });
  });
});
