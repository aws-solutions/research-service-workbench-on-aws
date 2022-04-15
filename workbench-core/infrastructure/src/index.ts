#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from './infrastructure-stack';
import { App, Aspects } from 'aws-cdk-lib';
// import { AwsSolutionsChecks } from 'cdk-nag';

const app: App = new cdk.App();
// eslint-disable-next-line no-new
new InfrastructureStack(app, 'InfrastructureStack');

// Aspects.of(app).add(new AwsSolutionsChecks({verbose: true}));
