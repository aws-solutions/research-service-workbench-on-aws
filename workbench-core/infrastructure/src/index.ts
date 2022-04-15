#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from './infrastructure-stack';
import { App } from 'aws-cdk-lib';

const app: App = new cdk.App();
// eslint-disable-next-line no-new
new InfrastructureStack(app, 'InfrastructureStack');
