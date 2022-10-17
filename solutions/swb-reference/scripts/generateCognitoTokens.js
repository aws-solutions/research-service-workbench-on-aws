#!/usr/bin/env node

/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// To use the script, follow the example below
// STAGE=<STAGE> node generateCognitoToken.js <userName> '<password>'

const { join } = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const { CognitoTokenService } = require('@aws/workbench-core-base');
const Csrf = require('csrf');

let outputs;
try {
  const apiStackOutputs = JSON.parse(
    fs.readFileSync(join(__dirname, `../src/config/${process.env.STAGE}.json`), 'utf8') // nosemgrep
  );
  const apiStackName = Object.entries(apiStackOutputs).map(([key, value]) => key)[0]; //output has a format { stackname: {...props} }
  outputs = apiStackOutputs[apiStackName];
} catch (e) {
  throw new Error(
    'There was a problem reading the main stage file. Please run cdk-deploy prior to running this script'
  );
}

const clientId = outputs.cognitoUserPoolClientId;
const userPoolId = outputs.cognitoUserPoolId;
const region = outputs.awsRegion;
const username = process.argv[2];
const password = process.argv[3];

const csrf = new Csrf();
const secret = csrf.secretSync();
const token = csrf.create(secret);

async function run() {
  try {
    const cognitoTokenService = new CognitoTokenService(region);
    const tokens = await cognitoTokenService.generateCognitoToken(
      userPoolId,
      clientId,
      username,
      undefined,
      password
    );
    console.log({
      ...tokens,
      csrfCookie: secret,
      csrfToken: token
    });
  } catch (e) {
    console.error('Unable to get cognito tokens', e);
  }
}

(async () => {
  await run();
})();
