/* eslint-disable no-new */

import * as cdk from 'aws-cdk-lib';

import { SWBStack } from './SWBStack';
import yaml from 'js-yaml';
import fs from 'fs';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config: any = yaml.load(
  // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
  // correct file
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFileSync(join(__dirname, `../src/config/${process.env.STAGE}.yaml`), 'utf8') // nosemgrep
);

const app: cdk.App = new cdk.App();

new SWBStack(app, `swb-${config.stage}-api`);

app.synth();
