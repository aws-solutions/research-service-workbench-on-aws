import { BillingMode, TableProps, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { WorkbenchEncryptionKeyWithRotation } from './workbenchEncryptionKeyWithRotation';

export class WorkbenchDynamodb extends Construct {
  public readonly table: Table;

  public constructor(scope: Construct, id: string, props: TableProps) {
    super(scope, id);

    this.table = new Table(this, `${id}`, {
      ...props,
      billingMode: props.billingMode ?? BillingMode.PAY_PER_REQUEST,
      encryption: TableEncryption.CUSTOMER_MANAGED,
      encryptionKey:
        props.encryptionKey ?? new WorkbenchEncryptionKeyWithRotation(this, `${id}-EncryptionKey`).key,
      pointInTimeRecovery: true
    });
  }
}
