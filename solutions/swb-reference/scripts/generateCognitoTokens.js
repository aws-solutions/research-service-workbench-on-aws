#!/usr/bin/env node

/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// To use the script, follow the example below
// STAGE=<STAGE> generateSecretHash.js <userName> '<password>'

const crypto = require('crypto');
const { join } = require('path');
const yaml = require('js-yaml');
const fs = require('fs');
const { AwsService } = require('@amzn/workbench-core-base');

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

const aws = new AwsService({
  region
});

async function getClientSecret() {
  const response = await aws.clients.cognito.describeUserPoolClient({
    UserPoolId: userPoolId,
    ClientId: clientId
  });
  return response.UserPoolClient.ClientSecret;
}

async function run() {
  try {
    const clientSecret = await getClientSecret();

    const secretHash = crypto
      .createHmac('SHA256', clientSecret)
      .update(username + clientId)
      .digest('base64');

    const response = await aws.clients.cognito.adminInitiateAuth({
      UserPoolId: userPoolId,
      ClientId: clientId,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: secretHash
      }
    });
    console.log(response.AuthenticationResult);
  } catch (e) {
    console.error('Unable to get cognito tokens', e);
  }
}

(async () => {
  await run();
})();
