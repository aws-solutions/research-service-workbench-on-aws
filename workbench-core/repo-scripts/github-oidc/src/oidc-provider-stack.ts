/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Stack, StackProps } from 'aws-cdk-lib';
import { CfnRole, OpenIdConnectProvider } from 'aws-cdk-lib/aws-iam';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class OIDCProviderStack extends Stack {
  public idp: OpenIdConnectProvider;

  public constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.idp = new OpenIdConnectProvider(this, 'OpenIdConnectProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com']
    });

    // CFN NAG Suppression
    const customResourceProviderRoleMetaDataNode = this.node
      .findChild('Custom::AWSCDKOpenIdConnectProviderCustomResourceProvider')
      .node.findChild('Role') as CfnRole;
    customResourceProviderRoleMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        // Suppress: W11 - IAM role should not allow * resource on its permissions policy
        {
          id: 'W11',
          reason:
            'This is a CustomResourceProviderRole created by OpenIdConnectProvider construct, I am OK with wildcard here'
        }
      ]
    });

    // CFN NAG Suppression
    const customResourceProviderHandlerMetaDataNode = this.node
      .findChild('Custom::AWSCDKOpenIdConnectProviderCustomResourceProvider')
      .node.findChild('Handler') as CfnFunction;
    customResourceProviderHandlerMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        // Suppress: W58 - Lambda functions require permission to write CloudWatch Logs
        {
          id: 'W58',
          reason:
            'This handler function has AWSLambdaBasicExecutionRole, which has permission to write to CloudWatch Logs'
        },
        // Suppress: W89 - Lambda functions should be deployed inside a VPC
        {
          id: 'W89',
          reason:
            'This Lambda Function is getting created internally by OpenIdConnectProvider construct and is being used to create Infrastructure'
        },
        // Suppress: W92 - Lambda functions should define ReservedConcurrentExecutions to reserve simultaneous executions
        {
          id: 'W92',
          reason:
            'This Lambda Function is getting created internally by OpenIdConnectProvider construct, I am OK with no ReservedConcurrentExecutions'
        }
      ]
    });
  }
}
