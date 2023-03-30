/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Aws, CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import {
  Effect,
  FederatedPrincipal,
  OpenIdConnectProvider,
  ManagedPolicy,
  PolicyStatement,
  Role,
  CfnRole
} from 'aws-cdk-lib/aws-iam';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import {
  mafSsmBasePath,
  mafCrossAccountRoleName,
  swbBase,
  swbStage,
  swbRegionShortName,
  mafMaxSessionDuration,
  swbMaxSessionDuration
} from './configs/config';

export interface GitHubOIDCStackProps extends StackProps {
  gitHubOrg: string;
  gitHubRepos: string[];
  idp: OpenIdConnectProvider;
  application: string;
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
        ),
        maxSessionDuration: Duration.hours(2)
      });

      if (props.application === 'MAF') {
        if (!mafSsmBasePath || !mafMaxSessionDuration) {
          throw new Error('SsmPath and MaxSessionDuration are required !');
        }

        const githubCfnRole = githubOIDCRole.node.defaultChild as CfnRole;
        githubCfnRole.maxSessionDuration = mafMaxSessionDuration;
        // eslint-disable-next-line no-new
        new ManagedPolicy(this, `${props.gitHubOrg}-${gitHubRepo}-GitHubOIDCCustomManagedPolicy`, {
          statements: [
            new PolicyStatement({
              sid: 'stsAccess',
              effect: Effect.ALLOW,
              actions: ['sts:AssumeRole'],
              resources: [
                `arn:${Aws.PARTITION}:iam::*:role/cdk-ssoa*`,
                `arn:${Aws.PARTITION}:iam::*:role/${mafCrossAccountRoleName}`
              ]
            }),
            new PolicyStatement({
              sid: 'ssmAccess',
              effect: Effect.ALLOW,
              actions: ['ssm:GetParameter'],
              resources: [
                `arn:${Aws.PARTITION}:ssm:${Aws.REGION}:${Aws.ACCOUNT_ID}:parameter/${mafSsmBasePath}/*`
              ]
            }),
            new PolicyStatement({
              sid: 'cognitoAccess',
              effect: Effect.ALLOW,
              actions: [
                'cognito-idp:DescribeUserPoolClient',
                'cognito-idp:AdminInitiateAuth',
                'cognito-idp:DeleteGroup',
                'cognito-idp:AdminDeleteUser'
              ],
              resources: [`arn:${Aws.PARTITION}:cognito-idp:${Aws.REGION}:${Aws.ACCOUNT_ID}:userpool/*`]
            }),
            new PolicyStatement({
              sid: 'dynamodbAccess',
              effect: Effect.ALLOW,
              actions: ['dynamodb:DeleteItem', 'dynamodb:GetItem', 'dynamodb:Query'],
              resources: [`arn:${Aws.PARTITION}:dynamodb:${Aws.REGION}:${Aws.ACCOUNT_ID}:table/*`]
            }),
            new PolicyStatement({
              sid: 'kmsAccess',
              effect: Effect.ALLOW,
              actions: ['kms:Decrypt', 'kms:DescribeKey'],
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
          roles: [githubOIDCRole]
        });
      } else if (props.application === 'SWB') {
        if (!swbStage || !swbBase || !swbRegionShortName || !swbMaxSessionDuration) {
          throw new Error('Stage and MaxSessionDuration are required !');
        }
        const githubCfnRole = githubOIDCRole.node.defaultChild as CfnRole;
        githubCfnRole.maxSessionDuration = swbMaxSessionDuration;
        // eslint-disable-next-line no-new
        new ManagedPolicy(this, `${props.gitHubOrg}-${gitHubRepo}-GitHubOIDCCustomManagedPolicy`, {
          statements: [
            new PolicyStatement({
              sid: 'stsAccess',
              effect: Effect.ALLOW,
              actions: ['sts:AssumeRole'],
              resources: [`arn:${Aws.PARTITION}:iam::${Aws.ACCOUNT_ID}:role/cdk-ssoa*`]
            }),
            new PolicyStatement({
              sid: 'cloudformationAccess',
              effect: Effect.ALLOW,
              actions: ['cloudformation:DescribeStacks'],
              resources: [
                `arn:${Aws.PARTITION}:cloudformation:${Aws.REGION}:${Aws.ACCOUNT_ID}:stack/${swbBase}-${swbStage}-${swbRegionShortName}/*`
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
              resources: [`arn:${Aws.PARTITION}:servicecatalog:${Aws.REGION}:${Aws.ACCOUNT_ID}:portfolio/*`]
            }),
            new PolicyStatement({
              sid: 'ssmAccess',
              effect: Effect.ALLOW,
              actions: ['ssm:GetParameter'],
              resources: [
                `arn:${Aws.PARTITION}:ssm:${Aws.REGION}:${Aws.ACCOUNT_ID}:parameter/${swbBase}/${swbStage}/*`
              ]
            }),
            new PolicyStatement({
              sid: 'cognitoAccess',
              effect: Effect.ALLOW,
              actions: [
                'cognito-idp:DescribeUserPoolClient',
                'cognito-idp:AdminInitiateAuth',
                'cognito-idp:DeleteGroup',
                'cognito-idp:AdminDeleteUser'
              ],
              resources: [`arn:${Aws.PARTITION}:cognito-idp:${Aws.REGION}:${Aws.ACCOUNT_ID}:userpool/*`]
            }),
            new PolicyStatement({
              sid: 'dynamodbAccess',
              effect: Effect.ALLOW,
              actions: ['dynamodb:DeleteItem', 'dynamodb:GetItem', 'dynamodb:Query'],
              resources: [`arn:${Aws.PARTITION}:dynamodb:${Aws.REGION}:${Aws.ACCOUNT_ID}:table/*`]
            }),
            new PolicyStatement({
              sid: 'kmsAccess',
              effect: Effect.ALLOW,
              actions: ['kms:Decrypt', 'kms:DescribeKey'],
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
          roles: [githubOIDCRole]
        });
      }

      // eslint-disable-next-line no-new
      new CfnOutput(this, `${props.gitHubOrg}-${gitHubRepo}-GithubOIDCRoleOutput`, {
        exportName: `${props.gitHubOrg}-${gitHubRepo}-GitHub-OIDC-Role-Arn`,
        value: githubOIDCRole.roleArn
      });

      // Suppress: AwsSolutions-IAM5: The IAM entity contains wildcard permissions
      NagSuppressions.addResourceSuppressionsByPath(
        this,
        '/aws-solutions-GitHubOIDCStack/aws-solutions-solution-spark-on-aws-GitHubOIDCCustomManagedPolicy/Resource',
        [
          {
            id: 'AwsSolutions-IAM5',
            reason: 'I am ok to use wildcard permission here'
            // appliesTo: [
            //   'Resource::arn:<AWS::Partition>:iam::<AWS::AccountId>:role/cdk-ssoa*',
            //   'Resource::arn:<AWS::Partition>:ssm:<AWS::Region>:<AWS::AccountId>:parameter/swb/sam/*',
            //   'Resource::arn:<AWS::Partition>:cognito-idp:<AWS::Region>:<AWS::AccountId>:userpool/*',
            //   'Resource::arn:<AWS::Partition>:dynamodb:<AWS::Region>:<AWS::AccountId>:table/*',
            //   'Resource::arn:<AWS::Partition>:kms:<AWS::Region>:<AWS::AccountId>:key/*',
            //   'Resource::*',
            //   'Resource::arn:<AWS::Partition>:cloudformation:<AWS::Region>:<AWS::AccountId>:stack/swb-sam-oh/*'
            // ]
          }
        ]
      );

      // Suppress: AwsSolutions-IAM5[Action::iam:*Role*]
      // NagSuppressions.addResourceSuppressionsByPath(
      //   this,
      //   '/aws-solutions-GitHubOIDCStack/aws-solutions-solution-spark-on-aws-GitHubOIDCCustomManagedPolicy/Resource',
      //   [
      //     {
      //       id: 'AwsSolutions-IAM5',
      //       reason: 'I am ok to use iam:*Role* Action for this role',
      //       appliesTo: ['Action::iam:*Role*']
      //     }
      //   ]
      // );

      // Suppress: AwsSolutions-IAM5[Resource::arn:<AWS::Partition>:iam::<AWS::AccountId>:role/*]
      // NagSuppressions.addResourceSuppressionsByPath(
      //   this,
      //   '/aws-solutions-GitHubOIDCStack/aws-solutions-solution-spark-on-aws-GitHubOIDCCustomManagedPolicy/Resource',
      //   [
      //     {
      //       id: 'AwsSolutions-IAM5',
      //       reason: 'I am ok to use wilcard for this resource',
      //       appliesTo: ['Resource::arn:<AWS::Partition>:iam::<AWS::AccountId>:role/*']
      //     }
      //   ]
      // );
    });
  }
}
