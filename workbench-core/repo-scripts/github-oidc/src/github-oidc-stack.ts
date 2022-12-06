/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Aws, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import {
  Effect,
  FederatedPrincipal,
  ManagedPolicy,
  OpenIdConnectProvider,
  PolicyStatement,
  Role
} from 'aws-cdk-lib/aws-iam';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';

export interface GitHubOIDCStackProps extends StackProps {
  gitHubOrg: string;
  gitHubRepos: string[];
  idp: OpenIdConnectProvider;
}

export class GitHubOIDCStack extends Stack {
  public constructor(scope: Construct, id: string, props: GitHubOIDCStackProps) {
    super(scope, id, props);

    //Create GitHubOIDC Role
    props.gitHubRepos.forEach((gitHubRepo) => {
      const githubOIDCRole: Role = new Role(this, `${props.gitHubOrg}-${gitHubRepo}-GitHub-OIDC-Role`, {
        assumedBy: new FederatedPrincipal(
          props.idp.openIdConnectProviderArn,
          {
            StringEquals: {
              'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
            },
            StringLike: {
              'token.actions.githubusercontent.com:sub': `repo:${props.gitHubOrg}/${gitHubRepo}:*`
            }
          },
          'sts:AssumeRoleWithWebIdentity'
        )
      });

      // eslint-disable-next-line no-new
      new ManagedPolicy(this, `${props.gitHubOrg}-${gitHubRepo}-GitHubOIDCCustomManagedPolicy`, {
        statements: [
          new PolicyStatement({
            sid: 'StsAssumeRole',
            effect: Effect.ALLOW,
            actions: ['sts:AssumeRole', 'iam:*Role*'],
            resources: [`arn:${Aws.PARTITION}:iam::${Aws.ACCOUNT_ID}:role/cdk-*`]
          }),
          new PolicyStatement({
            sid: 'CloudformationAccess',
            effect: Effect.ALLOW,
            actions: [
              'cloudformation:DescribeStacks',
              'cloudformation:GetTemplate',
              'cloudformation:CreateChangeSet',
              'cloudformation:DescribeChangeSet',
              'cloudformation:ExecuteChangeSet',
              'cloudformation:DescribeStackEvents',
              'cloudformation:DeleteChangeSet'
            ],
            resources: [`arn:${Aws.PARTITION}:cloudformation:${Aws.REGION}:${Aws.ACCOUNT_ID}:stack/*/*`]
          }),
          new PolicyStatement({
            sid: 'S3Access',
            effect: Effect.ALLOW,
            actions: ['s3:*Object', 's3:ListBucket', 's3:GetBucketLocation'],
            resources: [`arn:${Aws.PARTITION}:s3:::*`]
          }),
          new PolicyStatement({
            sid: 'ECRAccess',
            effect: Effect.ALLOW,
            actions: [
              'ecr:SetRepositoryPolicy',
              'ecr:GetLifecyclePolicy',
              'ecr:PutImageScanningConfiguration',
              'ecr:DescribeRepositories',
              'ecr:CreateRepository',
              'ecr:DeleteRepository',
              'ecr:PutImageTagMutability',
              'ecr:ListTagsForResource'
            ],
            resources: [`arn:${Aws.PARTITION}:ecr:${Aws.REGION}:${Aws.ACCOUNT_ID}:repository/cdk-*`]
          }),
          new PolicyStatement({
            sid: 'SSMAccess',
            effect: Effect.ALLOW,
            actions: ['ssm:GetParameter*', 'ssm:PutParameter*', 'ssm:DeleteParameter*'],
            resources: [`arn:${Aws.PARTITION}:ssm:${Aws.REGION}:${Aws.ACCOUNT_ID}:parameter/*`]
          }),
          new PolicyStatement({
            actions: ['cognito-idp:DescribeUserPoolClient', 'cognito-idp:AdminInitiateAuth'],
            resources: [`arn:aws:cognito-idp:${Aws.REGION}:${this.account}:userpool/*`],
            sid: 'CognitoAccess'
          }),
          new PolicyStatement({
            actions: [
              'dynamodb:BatchGetItem',
              'dynamodb:GetRecords',
              'dynamodb:GetShardIterator',
              'dynamodb:Query',
              'dynamodb:GetItem',
              'dynamodb:Scan',
              'dynamodb:ConditionCheckItem',
              'dynamodb:BatchWriteItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
              'dynamodb:DescribeTable'
            ],
            resources: [
              `arn:aws:dynamodb:${Aws.REGION}:${Aws.ACCOUNT_ID}:table/*`,
              `arn:aws:dynamodb:${Aws.REGION}:${Aws.ACCOUNT_ID}:table/*/index/*`
            ],
            sid: 'DynamoDBAccess'
          }),
          new PolicyStatement({
            actions: ['servicecatalog:CreatePortfolioShare', 'servicecatalog:ListPortfolios'],
            resources: [`arn:aws:servicecatalog:${Aws.REGION}:${this.account}:*/*`],
            sid: 'ServiceCatalogAccess'
          })
        ],
        roles: [githubOIDCRole]
      });

      // eslint-disable-next-line no-new
      new CfnOutput(this, `${props.gitHubOrg}-${gitHubRepo}-GithubOIDCRoleOutput`, {
        exportName: `${props.gitHubOrg}-${gitHubRepo}-GitHub-OIDC-Role-Arn`,
        value: githubOIDCRole.roleArn
      });

      // Suppress AwsSolutions-IAM4[Policy::arn:<AWS::Partition>:iam::aws:policy/AdministratorAccess]: The IAM user, role, or group uses AWS managed policies
      NagSuppressions.addResourceSuppressionsByPath(
        this,
        '/aws-solutions-GitHubOIDCStack/aws-solutions-solution-spark-on-aws-GitHub-OIDC-Role/Resource',
        [{ id: 'AwsSolutions-IAM4', reason: 'Admin access for deployment and integration test' }]
      );
    });
  }
}
