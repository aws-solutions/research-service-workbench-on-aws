/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CfnOutput, CfnResource, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { FederatedPrincipal, OpenIdConnectProvider, ManagedPolicy, Role, CfnRole } from 'aws-cdk-lib/aws-iam';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { maf, swb } from './configs/config.json';
import { MafGithubOidcRolePolicy } from './constructs/maf-github-oidc-role-policy';
import { SwbGithubOidcRolePolicy } from './constructs/swb-github-oidc-role-policy';

export interface GitHubOIDCStackProps extends StackProps {
  gitHubOrg: string;
  gitHubRepos: string[];
  idp: OpenIdConnectProvider | undefined;
  application: string;
}

export class GitHubOIDCStack extends Stack {
  public constructor(scope: Construct, id: string, props: GitHubOIDCStackProps) {
    super(scope, id, props);

    if (!props.idp) {
      props.idp = OpenIdConnectProvider.fromOpenIdConnectProviderArn(
        this,
        'ExistingOIDCProvider',
        `arn:aws:iam::${props.env?.account}:oidc-provider/token.actions.githubusercontent.com`
      ) as OpenIdConnectProvider;
    }
    //Create GitHubOIDC Role
    props.gitHubRepos.forEach((gitHubRepo) => {
      const githubOIDCRole: Role = new Role(this, `${props.gitHubOrg}-${gitHubRepo}-GitHub-OIDC-Role`, {
        assumedBy: new FederatedPrincipal(
          props.idp!.openIdConnectProviderArn,
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

      let githubCustomManagedPolicy!: ManagedPolicy;

      if (props.application === 'MAF') {
        if (!maf.mafSsmBasePath || !maf.mafMaxSessionDuration) {
          throw new Error('SsmPath and MaxSessionDuration are required !');
        }

        const githubCfnRole = githubOIDCRole.node.defaultChild as CfnRole;
        githubCfnRole.maxSessionDuration = maf.mafMaxSessionDuration;

        // eslint-disable-next-line no-new
        githubCustomManagedPolicy = new MafGithubOidcRolePolicy(
          this,
          `${props.gitHubOrg}-${gitHubRepo}-MafGithubOidcRolePolicy`,
          {
            gitHubOrg: props.gitHubOrg,
            gitHubRepo: gitHubRepo,
            githubOIDCRole: githubOIDCRole
          }
        ).policy;

        // Suppress: AwsSolutions-IAM5: The IAM entity contains wildcard permissions
        NagSuppressions.addResourceSuppressionsByPath(
          this,
          '/aws-solutions-GitHubOIDCStack/aws-solutions-solution-spark-on-aws-MafGithubOidcRolePolicy/aws-solutions-solution-spark-on-aws-GitHubOIDCCustomManagedPolicy/Resource',
          [
            {
              id: 'AwsSolutions-IAM5',
              reason: 'I am ok to use wildcard permission here'
            }
          ]
        );
      } else if (props.application === 'SWB') {
        if (!swb.swbStage || !swb.swbBase || !swb.swbRegionShortName || !swb.swbMaxSessionDuration) {
          throw new Error('Stage and MaxSessionDuration are required !');
        }
        const githubCfnRole = githubOIDCRole.node.defaultChild as CfnRole;
        githubCfnRole.maxSessionDuration = swb.swbMaxSessionDuration;

        githubCustomManagedPolicy = new SwbGithubOidcRolePolicy(
          this,
          `${props.gitHubOrg}-${gitHubRepo}-SwbGithubOidcRolePolicy`,
          {
            gitHubOrg: props.gitHubOrg,
            gitHubRepo: gitHubRepo,
            githubOIDCRole: githubOIDCRole
          }
        ).policy;

        // Suppress: AwsSolutions-IAM5: The IAM entity contains wildcard permissions
        NagSuppressions.addResourceSuppressionsByPath(
          this,
          '/aws-solutions-GitHubOIDCStack/aws-solutions-solution-spark-on-aws-SwbGithubOidcRolePolicy/aws-solutions-solution-spark-on-aws-GitHubOIDCCustomManagedPolicy/Resource',
          [
            {
              id: 'AwsSolutions-IAM5',
              reason: 'I am ok to use wildcard permission here'
            }
          ]
        );
      }

      const githubCustomManagedPolicyNode = githubCustomManagedPolicy.node.findChild(
        'Resource'
      ) as CfnResource;
      githubCustomManagedPolicyNode.addMetadata('cfn_nag', {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        rules_to_suppress: [
          // Suppress: W13 - IAM managed policy should not allow * resource
          {
            id: 'W13',
            reason: 'I am OK with using wildcard here'
          }
        ]
      });

      // eslint-disable-next-line no-new
      new CfnOutput(this, `${props.gitHubOrg}-${gitHubRepo}-GithubOIDCRoleOutput`, {
        exportName: `${props.gitHubOrg}-${gitHubRepo}-GitHub-OIDC-Role-Arn`,
        value: githubOIDCRole.roleArn
      });
    });
  }
}
