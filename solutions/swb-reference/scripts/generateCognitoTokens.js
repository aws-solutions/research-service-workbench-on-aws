#!/usr/bin/env node

/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// To use the script, follow the example below
// STAGE=<STAGE> generateCognitoToken.js <userName> '<password>'

const { join } = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const { CognitoTokenService } = require('@aws/workbench-core-base');

const config = yaml.load(
  // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
  // correct file
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFileSync(join(__dirname, `../integration-tests/config/${process.env.STAGE}.yaml`), 'utf8') // nosemgrep
);

const clientId = config.clientId;
const userPoolId = config.userPoolId;
const region = config.awsRegion;
const username = process.argv[2];
const password = process.argv[3];

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
    console.log(tokens);
  } catch (e) {
    console.error('Unable to get cognito tokens', e);
  }
}

(async () => {
  await run();
})();
