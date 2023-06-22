/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import { Aws, CfnOutput } from 'aws-cdk-lib';
import { AccountPrincipal, PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Key, KeyProps } from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export class WorkbenchEncryptionKeyWithRotation extends Construct {
  public readonly key: Key;

  public constructor(scope: Construct, id: string, props?: KeyProps) {
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

    this.key = new Key(this, `${id}-Key`, {
      ...props,
      enableKeyRotation: true,
      policy: props?.policy ?? mainKeyPolicy,
      alias: `alias/${id}`
    });

    new CfnOutput(this, id, {
      value: this.key.keyArn
    });
  }
}
