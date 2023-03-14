/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/**
 * This script accepts two optional parameters:
 * --stage=<stage> indicating stage to be used. Default = testEnv
 * --mode=open|run indicating if Cypress UI should be open (equivalent to `cypress open`) or suites should be run (equivalent to `cypress run`). Default = run
 *
 */

const cypress = require('cypress');
const { SSM } = require('@aws-sdk/client-ssm');
const { CognitoIdentityProvider } = require('@aws-sdk/client-cognito-identity-provider');
const parseArgs = require('minimist');
const fs = require('fs');
const yaml = require('js-yaml');
const { join } = require('path');

const getSecret = async (ssm, name) => {
  const response = await ssm.getParameter({
    Name: name,
    WithDecryption: true
  });

  return response.Parameter.Value;
};

const main = async ({ stage, mode }) => {
  const config = yaml.load(
    fs.readFileSync(join(__dirname, `../integration-tests/config/${stage}.yaml`), 'utf8')
  );

  const apiStackOutputs = JSON.parse(
    fs.readFileSync(join(__dirname, `../src/config/${stage}.json`), 'utf8') // nosemgrep
  );

  const settings = {
    ...config,
    ...apiStackOutputs['ExampleStack']
  };

  const cognitoDomainName = settings['ExampleCognitoDomainName'];
  const userPoolId = settings['ExampleCognitoUserPoolId'];
  const clientId = settings['ExampleCognitoWebUiUserPoolClientId'];
  const region = settings['AwsRegion'];
  const rootUserNameParamStorePath = settings['rootUserNameParamStorePath'];
  const rootPasswordParamStorePath = settings['rootPasswordParamStorePath'];
  const restApiEndpoint = settings['ExampleRestApiEndpoint9C6D55BB'];

  const ssm = new SSM({
    region
  });

  const userName = await getSecret(ssm, rootUserNameParamStorePath);
  const password = await getSecret(ssm, rootPasswordParamStorePath);

  const cognitoIdentityProvider = new CognitoIdentityProvider({ region });
  const { UserPoolClient } = await cognitoIdentityProvider.describeUserPoolClient({
    UserPoolId: userPoolId,
    ClientId: clientId
  });

  console.info('Region:', region);
  console.info('Stage:', stage);
  console.info('Cognito domain name:', cognitoDomainName);
  console.info('REST API endpoint:', restApiEndpoint);
  console.info('Client ID:', clientId);
  console.info('Root user name parameter store path:', rootUserNameParamStorePath);
  console.info('Root user password parameter store path:', rootPasswordParamStorePath);
  console.info('Username:', userName);

  (mode === 'open' ? cypress.open : cypress.run)({
    reporter: 'junit',
    config: {
      video: true
    },
    env: {
      AWS_REGION: region,
      COGNITO_USER_POOL_ID: userPoolId,
      COGNITO_DOMAIN_NAME: cognitoDomainName,
      COGNITO_CALLBACK_URL: 'http://localhost:3000/',
      COGNITO_USER_POOL_CLIENT_ID: clientId,
      COGNITO_USER_POOL_CLIENT_SECRET: UserPoolClient.ClientSecret,
      REST_API_ENDPOINT: restApiEndpoint,
      USERNAME: userName,
      PASSWORD: password
    }
  });
};

const argv = parseArgs(process.argv.slice(2), {
  default: {
    stage: 'testEnv',
    mode: 'run'
  }
});

void main(argv);
