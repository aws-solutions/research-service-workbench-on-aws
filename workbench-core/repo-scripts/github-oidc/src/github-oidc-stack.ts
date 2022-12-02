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
        // roleName: `${props.gitHubOrg}-${gitHubRepo}-GitHub-OIDC-Role`,
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
      const gitHubOIDCCustomManagedPolicy: ManagedPolicy = new ManagedPolicy(
        this,
        `${props.gitHubOrg}-${gitHubRepo}-GitHubOIDCCustomManagedPolicy`,
        {
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ['sts:AssumeRole'],
              resources: [`arn:${Aws.PARTITION}:iam::${Aws.ACCOUNT_ID}:role/cdk-*`]
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ['cloudformation:DescribeStacks'],
              resources: [`arn:${Aws.PARTITION}:cloudformation:${Aws.REGION}:${Aws.ACCOUNT_ID}:stack/*`]
            })
          ],
          roles: [githubOIDCRole]
        }
      );

      // eslint-disable-next-line no-new
      new CfnOutput(this, `${props.gitHubOrg}-${gitHubRepo}-GithubOIDCRoleOutput`, {
        exportName: `${props.gitHubOrg}-${gitHubRepo}-GitHub-OIDC-Role-Arn`,
        value: githubOIDCRole.roleArn
      });

      // Suppress AwsSolutions-IAM5[Resource::arn:<AWS::Partition>:iam::<AWS::AccountId>:role/cdk-*]: The IAM entity contains wildcard permissions
      NagSuppressions.addResourceSuppressions(gitHubOIDCCustomManagedPolicy, [
        { id: 'AwsSolutions-IAM5', reason: 'I am OK with using wildcard here' }
      ]);
    });
  }
}
