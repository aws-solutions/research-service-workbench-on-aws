import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
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

  test('should be able set BillingMode to Provisioned', () => {
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
});
