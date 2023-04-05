import { Aws } from 'aws-cdk-lib';
import { Effect, IRole, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { maf } from '../configs/config.json';

export interface MafGithubOidcRolePolicyProps {
  gitHubOrg: string;
  gitHubRepo: string;
  githubOIDCRole: IRole;
}

export class MafGithubOidcRolePolicy extends Construct {
  public policy: ManagedPolicy;

  public constructor(scope: Construct, id: string, props: MafGithubOidcRolePolicyProps) {
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
            resources: [
              `arn:${Aws.PARTITION}:iam::*:role/cdk-*`,
              `arn:${Aws.PARTITION}:iam::*:role/${maf.mafCrossAccountRoleName}`
            ]
          }),
          new PolicyStatement({
            sid: 'ssmAccess',
            effect: Effect.ALLOW,
            actions: ['ssm:GetParameter'],
            resources: [
              `arn:${Aws.PARTITION}:ssm:${Aws.REGION}:${Aws.ACCOUNT_ID}:parameter/${maf.mafSsmBasePath}/*`
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
        roles: [props.githubOIDCRole]
      }
    );
  }
}
