/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  BillingMode,
  TableProps,
  Table,
  TableEncryption,
  GlobalSecondaryIndexProps
} from 'aws-cdk-lib/aws-dynamodb';
import { IKey } from 'aws-cdk-lib/aws-kms';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import _ from 'lodash';
import { WorkbenchEncryptionKeyWithRotation } from './workbenchEncryptionKeyWithRotation';

export interface WorkbenchDynamodbProps extends TableProps {
  gsis?: GlobalSecondaryIndexProps[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  lambdas?: Function[];
}

export class WorkbenchDynamodb extends Construct {
  public readonly table: Table;

  public constructor(scope: Construct, id: string, props: WorkbenchDynamodbProps) {
    super(scope, id);

    let encryptionKey: IKey | undefined = undefined;
    const encryption: TableEncryption = props.encryption ?? TableEncryption.CUSTOMER_MANAGED;
    if (encryption === TableEncryption.CUSTOMER_MANAGED) {
      encryptionKey =
        props.encryptionKey ?? new WorkbenchEncryptionKeyWithRotation(this, `${id}-EncryptionKey`).key;
    }

    this.table = new Table(this, `${id}`, {
      ...props,
      billingMode: props.billingMode ?? BillingMode.PAY_PER_REQUEST,
      encryption: encryption,
      encryptionKey: encryptionKey,
      pointInTimeRecovery: true
    });

    _.map(props.gsis, (gsi) => {
      this.table.addGlobalSecondaryIndex(gsi);
    });

    if (props.lambdas?.length) {
      _.map(props.lambdas, (lambda) => {
        this.table.grantReadWriteData(lambda);
      });
    }
  }
}
