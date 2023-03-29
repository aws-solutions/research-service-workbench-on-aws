#!/usr/bin/env node

/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { App, Aspects, Environment } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { gitHubOrgToRepos } from './configs/config';
import { GitHubOIDCStack } from './github-oidc-stack';
import { OIDCProviderStack } from './oidc-provider-stack';

const app: App = new cdk.App();

const env: Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT!,
  region: process.env.CDK_DEFAULT_REGION!
};

const oidcProviderStack: OIDCProviderStack = new OIDCProviderStack(app, 'OIDCProviderStack', {
  env: env
});

Object.keys(gitHubOrgToRepos).forEach((gitHubOrg) => {
  // eslint-disable-next-line no-new
  new GitHubOIDCStack(app, `${gitHubOrg}-GitHubOIDCStack`, {
    env: env,
    gitHubOrg: gitHubOrg,
    gitHubRepos: gitHubOrgToRepos[`${gitHubOrg}`],
    idp: oidcProviderStack.idp
  });
});

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
