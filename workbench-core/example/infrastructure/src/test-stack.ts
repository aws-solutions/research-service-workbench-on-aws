import { EncryptionKeyWithRotation, WorkbenchDynamodb } from '@aws/workbench-core-infrastructure';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class TestStack extends Stack {
  public constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const encryptionKey: EncryptionKeyWithRotation = new EncryptionKeyWithRotation(
      this,
      'TestDynamodb-EncryptionKey',
      {
        removalPolicy: RemovalPolicy.DESTROY
      }
    );

    // eslint-disable-next-line no-new
    new WorkbenchDynamodb(this, 'TestDynamodb', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      encryptionKey: encryptionKey.key
    });
  }
}
