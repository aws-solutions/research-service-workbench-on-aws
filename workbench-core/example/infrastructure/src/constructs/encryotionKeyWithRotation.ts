/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import { Aws, CfnOutput } from 'aws-cdk-lib';
import { AccountPrincipal, PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export interface EncriptionKeyWithRotationProps {
  encryptionKeyOutputName: string;
}

export class EncryptionKeyWithRotation extends Construct {
  public key: Key;

  public constructor(scope: Construct, id: string, props?: EncriptionKeyWithRotationProps) {
    super(scope, id);

    const mainKeyPolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: ['kms:*'],
          principals: [new AccountPrincipal(Aws.ACCOUNT_ID)],
          resources: ['*'],
          sid: 'main-key-share-statement'
        })
      ]
    });

    this.key = new Key(this, 'EncryptionKey', {
      enableKeyRotation: true,
      policy: mainKeyPolicy
    });

    const encryptionKeyOutputName: string = props ? props.encryptionKeyOutputName : 'EncryptionKeyOutput';

    new CfnOutput(this, encryptionKeyOutputName, {
      value: this.key.keyArn
    });
  }
}
