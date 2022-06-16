/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as cdk from 'aws-cdk-lib';
import { join } from 'path';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejsLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as customresources from 'aws-cdk-lib/custom-resources';
import * as constructs from 'constructs';

import * as network from './network';
import * as utilities from './utilities';

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

  constructor(scope: network.HyperledgerFabricNetwork, id: string) {
    super(scope, id);

    // Collect metadata on the stack
    // const partition = cdk.Stack.of(this).partition;
    // const region = cdk.Stack.of(this).region;

    const memberId = scope.memberId;
    const networkId = scope.networkId;
    const membersToInvite = scope.additionalMembers;

    // Role for the custom resource lambda functions
    const customResourceRole = new iam.Role(this, 'CustomResourceRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });

    // Policies for the custom resource lambda to enroll and register users
    customResourceRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );
    customResourceRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonManagedBlockchainFullAccess')
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
      logRetention: logs.RetentionDays.ONE_DAY
    });

    // Populate the custom role static variable
    HyperledgerFabricInvite.customRole = customResourceRole;
  }
}
