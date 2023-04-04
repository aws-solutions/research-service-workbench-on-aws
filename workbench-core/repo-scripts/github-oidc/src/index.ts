#!/usr/bin/env node

/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { App, Aspects, Environment } from 'aws-cdk-lib';
import { OpenIdConnectProvider } from 'aws-cdk-lib/aws-iam';
import { AwsSolutionsChecks } from 'cdk-nag';
import { gitHubOrgToRepos } from './configs/config.json';
import { GitHubOIDCStack } from './github-oidc-stack';
import { OIDCProviderStack } from './oidc-provider-stack';

const app: App = new cdk.App();

const application: string = app.node.tryGetContext('application');
const existingOIDC: string = app.node.tryGetContext('existingOIDC');

if (!application || (application !== 'SWB' && application !== 'MAF')) {
  throw new Error('CDK Context "application" is required. Valid values: "SWB or MAF"');
}

const env: Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT!,
  region: process.env.CDK_DEFAULT_REGION!
};

let oidcProvider: OpenIdConnectProvider | undefined;

let oidcProviderStack: OIDCProviderStack;

if (!existingOIDC) {
  oidcProviderStack = new OIDCProviderStack(app, 'OIDCProviderStack', {
    env: env
  });
  oidcProvider = oidcProviderStack.idp;
}

for (const [key, values] of Object.entries(gitHubOrgToRepos)) {
  // eslint-disable-next-line no-new
  new GitHubOIDCStack(app, `${key}-GitHubOIDCStack`, {
    env: env,
    gitHubOrg: key,
    gitHubRepos: values,
    idp: oidcProvider,
    application: application
  });
}

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
