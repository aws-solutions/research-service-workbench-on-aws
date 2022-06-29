/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { join } from 'path';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejsLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as customresources from 'aws-cdk-lib/custom-resources';
import * as constructs from 'constructs';

import * as network from './network';

/**
 * Creates custom resources to enroll admin and register user
 * identities with the CA using the fabric-ca-client SDK.
 * Admin identity is enrolled by default. User identities are
 * registered and enrolled, if provided.
 */
export class HyperledgerFabricInvite extends constructs.Construct {
  /**
   * Role for custom resource lambda to assume
   */
  public static customRole: iam.Role;

  /**
   * Custom provider to register user identity
   */
  public inviteProvider: customresources.Provider;

  public constructor(scope: network.HyperledgerFabricNetwork, id: string) {
    super(scope, id);

    // Collect metadata on the stack
    const partition = cdk.Stack.of(this).partition;
    const region = cdk.Stack.of(this).region;

    const memberId = scope.memberId;
    const networkId = scope.networkId;
    const membersToInvite = scope.additionalMembers;

    // Role for the custom resource lambda functions
    const customResourceRole = new iam.Role(this, 'CustomResourceRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });

    // Policies for the custom resource lambda to invite new members to join
    customResourceRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['logs:CreateLogStream', 'logs:CreateLogGroup', 'logs:PutLogEvents'],
        resources: [`arn:${partition}:logs:${region}:*:*`]
      })
    );
    customResourceRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'managedblockchain:CreateProposal',
          'managedblockchain:VoteOnProposal',
          'managedblockchain:TagResource'
        ],
        resources: [
          `arn:${partition}:managedblockchain:${region}::networks/*`,
          `arn:${partition}:managedblockchain:${region}::proposals/*`
        ]
      })
    );

    const inviteFunction = new nodejsLambda.NodejsFunction(this, 'InviteFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'inviteMemberHandler',
      depsLockFilePath: join(__dirname, '/../../../../../common/config/rush/pnpm-lock.yaml'),
      entry: join(__dirname, '/../../src/lambdas/invite-member.ts'),
      environment: {
        MEMBER_ID: memberId,
        NETWORK_ID: networkId,
        MEMBERS_TO_INVITE: membersToInvite.join(',')
      },
      role: customResourceRole,
      timeout: cdk.Duration.minutes(1),
      bundling: {
        externalModules: ['aws-sdk']
      }
    });

    // Custom Resource provider
    this.inviteProvider = new customresources.Provider(this, 'InviteProvider', {
      onEventHandler: inviteFunction,
      logRetention: logs.RetentionDays.ONE_YEAR
    });

    // Populate the custom role static variable
    HyperledgerFabricInvite.customRole = customResourceRole;
  }
}
