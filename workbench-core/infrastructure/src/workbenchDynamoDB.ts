import { RemovalPolicy } from 'aws-cdk-lib';
import { BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { Attribute } from 'aws-cdk-lib/aws-dynamodb';
import { TableProps, Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { IKey } from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export interface WorkbenchDynamoDBProps {
  partitionKey?: Attribute;
  sortKey?: Attribute;
  billingMode?: BillingMode;
  encryption?: TableEncryption;
  encryptionKey?: IKey;
  pointInTimeRecovery?: boolean;
  removalPolicy?: RemovalPolicy;
  replicationRegion?: string[];
}

export class WorkbenchDynamoDB extends Construct {
  public table: Table;

  public constructor(scope: Construct, id: string, props: WorkbenchDynamoDBProps) {
    super(scope, id);

    this.table = new Table(this, id, {
      partitionKey: props.partitionKey ? props.partitionKey : { name: 'pk', type: AttributeType.STRING },
      sortKey: props.sortKey,
      billingMode: props.billingMode ? props.billingMode : BillingMode.PAY_PER_REQUEST,
      encryption: props.encryption ? props.encryption : TableEncryption.DEFAULT,
      encryptionKey: props.encryptionKey,
      pointInTimeRecovery: props.pointInTimeRecovery,
      removalPolicy: props.removalPolicy,
      replicationRegions: props.replicationRegion
    });
  }
}
