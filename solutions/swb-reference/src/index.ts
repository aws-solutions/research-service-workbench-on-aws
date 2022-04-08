/* eslint-disable no-new */
import * as cdk from 'aws-cdk-lib';
import { SWBStack } from './SWBStack';

const app: cdk.App = new cdk.App();
new SWBStack(app);

app.synth();
