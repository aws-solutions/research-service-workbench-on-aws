import * as cdk from 'aws-cdk-lib';

import { ApiLambdaCrudDynamoDBStack } from './api';

const app: cdk.App = new cdk.App();

// eslint-disable-next-line no-new
new ApiLambdaCrudDynamoDBStack(app, 'Api');

app.synth();

// console.log('test');
