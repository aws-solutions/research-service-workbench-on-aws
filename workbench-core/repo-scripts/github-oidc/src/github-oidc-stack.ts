/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { FederatedPrincipal, ManagedPolicy, OpenIdConnectProvider, Role } from 'aws-cdk-lib/aws-iam';
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
        ),
        managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')]
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
