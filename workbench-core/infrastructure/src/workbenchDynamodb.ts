/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { BillingMode, TableProps, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { IKey } from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import { WorkbenchEncryptionKeyWithRotation } from './workbenchEncryptionKeyWithRotation';

export class WorkbenchDynamodb extends Construct {
  public readonly table: Table;

  public constructor(scope: Construct, id: string, props: TableProps) {
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
  }
}
