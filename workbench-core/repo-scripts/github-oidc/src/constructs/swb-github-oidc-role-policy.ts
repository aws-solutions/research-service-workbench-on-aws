/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Aws } from 'aws-cdk-lib';
import { Effect, IRole, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { swb } from '../configs/config.json';

export interface SwbGithubOidcRolePolicyProps {
  gitHubOrg: string;
  gitHubRepo: string;
  githubOIDCRole: IRole;
}

export class SwbGithubOidcRolePolicy extends Construct {
  public policy: ManagedPolicy;

  public constructor(scope: Construct, id: string, props: SwbGithubOidcRolePolicyProps) {
    super(scope, id);

    this.policy = new ManagedPolicy(
      this,
      `${props.gitHubOrg}-${props.gitHubRepo}-GitHubOIDCCustomManagedPolicy`,
      {
        statements: [
          new PolicyStatement({
            sid: 'stsAccess',
            effect: Effect.ALLOW,
            actions: ['sts:AssumeRole'],
            resources: [`arn:${Aws.PARTITION}:iam::${Aws.ACCOUNT_ID}:role/cdk-*`]
          }),
          new PolicyStatement({
            sid: 'cloudformationAccess',
            effect: Effect.ALLOW,
            actions: ['cloudformation:DescribeStacks'],
            resources: [
              `arn:${Aws.PARTITION}:cloudformation:${Aws.REGION}:${Aws.ACCOUNT_ID}:stack/${swb.swbBase}-${swb.swbStage}-${swb.swbRegionShortName}/*`
            ]
          }),
          new PolicyStatement({
            sid: 'serviceCatalogPortfolioAccess',
            effect: Effect.ALLOW,
            actions: ['servicecatalog:ListPortfolios'],
            resources: [`arn:${Aws.PARTITION}:servicecatalog:${Aws.REGION}:${Aws.ACCOUNT_ID}:*/*`]
          }),
          new PolicyStatement({
            sid: 'serviceCatalogProductAccess',
            effect: Effect.ALLOW,
            actions: ['servicecatalog:SearchProductsAsAdmin'],
            resources: [`arn:${Aws.PARTITION}:catalog:${Aws.REGION}:${Aws.ACCOUNT_ID}:portfolio/*`]
          }),
          new PolicyStatement({
            sid: 'serviceCatalogArtifactAccess',
            effect: Effect.ALLOW,
            actions: [
              'servicecatalog:ListProvisioningArtifacts',
              'servicecatalog:DescribeProvisioningArtifact'
            ],
            resources: [`arn:${Aws.PARTITION}:catalog:${Aws.REGION}:${Aws.ACCOUNT_ID}:product/*`]
          }),
          new PolicyStatement({
            sid: 'ssmAccess',
            effect: Effect.ALLOW,
            actions: ['ssm:GetParameter'],
            resources: [
              `arn:${Aws.PARTITION}:ssm:${Aws.REGION}:${Aws.ACCOUNT_ID}:parameter/${swb.swbBase}/${swb.swbStage}/*`
            ]
          }),
          new PolicyStatement({
            sid: 'cognitoAccess',
            effect: Effect.ALLOW,
            actions: [
              'cognito-idp:DescribeUserPoolClient',
              'cognito-idp:AdminInitiateAuth',
              'cognito-idp:DeleteGroup',
              'cognito-idp:AdminDeleteUser',
              'cognito-idp:AdminCreateUser',
              'cognito-idp:AdminAddUserToGroup'
            ],
            resources: [`arn:${Aws.PARTITION}:cognito-idp:${Aws.REGION}:${Aws.ACCOUNT_ID}:userpool/*`]
          }),
          new PolicyStatement({
            sid: 'dynamodbAccess',
            effect: Effect.ALLOW,
            actions: [
              'dynamodb:DeleteItem',
              'dynamodb:GetItem',
              'dynamodb:Query',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem'
            ],
            resources: [`arn:${Aws.PARTITION}:dynamodb:${Aws.REGION}:${Aws.ACCOUNT_ID}:table/*`]
          }),
          new PolicyStatement({
            sid: 'eventAccess',
            effect: Effect.ALLOW,
            actions: ['events:RemovePermission'],
            resources: [`arn:${Aws.PARTITION}:events:${Aws.REGION}:${Aws.ACCOUNT_ID}:event-bus/default`]
          }),
          new PolicyStatement({
            sid: 'eventRuleAccess',
            effect: Effect.ALLOW,
            actions: ['events:DescribeRule'],
            resources: [`arn:${Aws.PARTITION}:events:${Aws.REGION}:${Aws.ACCOUNT_ID}:rule/RouteHostEvents`]
          }),
          new PolicyStatement({
            sid: 'kmsAccess',
            effect: Effect.ALLOW,
            actions: ['kms:Decrypt', 'kms:DescribeKey', 'kms:GenerateDataKey'],
            resources: [`arn:${Aws.PARTITION}:kms:${Aws.REGION}:${Aws.ACCOUNT_ID}:key/*`]
          }),
          new PolicyStatement({
            sid: 's3Access',
            effect: Effect.ALLOW,
            actions: [
              's3:GetObject',
              's3:GetObjectVersion',
              's3:GetObjectTagging',
              's3:AbortMultipartUpload',
              's3:ListMultipartUploadParts',
              's3:GetBucketPolicy',
              's3:PutBucketPolicy',
              's3:PutObject',
              's3:PutObjectAcl',
              's3:PutObjectTagging',
              's3:DeleteObject',
              's3:ListBucket',
              's3:PutAccessPointPolicy',
              's3:GetAccessPointPolicy',
              's3:CreateAccessPoint',
              's3:DeleteAccessPoint'
            ],
            resources: ['*']
          })
        ],
        roles: [props.githubOIDCRole]
      }
    );
  }
}
