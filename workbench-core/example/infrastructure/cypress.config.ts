/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig } from 'cypress';

import { SSM } from '@aws-sdk/client-ssm';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import fs from 'fs';
import yaml from 'js-yaml';
import { join } from 'path';
import { merge } from 'lodash';
import esbuild from 'esbuild';

const COGNITO_CALLBACK_URL = 'http://localhost:3000';

const getSecret = async (ssm: SSM, name: string) => {
  const response = await ssm.getParameter({
    Name: name,
    WithDecryption: true
  });

  return response.Parameter!.Value;
};

const getEnvironmentVariables = async (stage: string) => {
  console.info('Stage:', stage);

  const config = yaml.load(
    fs.readFileSync(join(__dirname, `./integration-tests/config/${stage}.yaml`), 'utf8')
  );

  const apiStackOutputs = JSON.parse(
    fs.readFileSync(join(__dirname, `./src/config/${stage}.json`), 'utf8') // nosemgrep
  );

  const settings = {
    ...config,
    ...apiStackOutputs['ExampleStack']
  };

  const cognitoDomainName = settings['ExampleCognitoDomainName'];
  const userPoolId = settings['ExampleCognitoUserPoolId'];
  const clientId = settings['ExampleCognitoWebUiUserPoolClientId'];
  const region = settings['MainAccountRegion'];
  const rootUserNameParamStorePath = settings['rootUserNameParamStorePath'];
  const rootPasswordParamStorePath = settings['rootPasswordParamStorePath'];
  const restApiEndpoint = settings['ExampleRestApiEndpoint9C6D55BB'];

  const ssm = new SSM({
    region
  });

  const userName = await getSecret(ssm, rootUserNameParamStorePath);
  const password = await getSecret(ssm, rootPasswordParamStorePath);

  console.info('Region:', region);
  console.info('Cognito domain name:', cognitoDomainName);
  console.info('REST API endpoint:', restApiEndpoint);
  console.info('Client ID:', clientId);
  console.info('Root user name parameter store path:', rootUserNameParamStorePath);
  console.info('Root user password parameter store path:', rootPasswordParamStorePath);
  console.info('Username:', userName);

  const cognitoIdentityProvider = new CognitoIdentityProvider({ region });
  const { UserPoolClient } = await cognitoIdentityProvider.describeUserPoolClient({
    UserPoolId: userPoolId,
    ClientId: clientId
  });

  await esbuild.build({
    entryPoints: [join(__dirname, 'cypress/app/index.tsx')],
    bundle: true,
    platform: 'browser',
    target: 'node14',
    outdir: join(__dirname, 'build/cypress'),
    define: {
      COGNITO_USER_POOL_CLIENT_ID: `"${clientId}"`,
      COGNITO_DOMAIN_NAME: `"${cognitoDomainName}"`,
      COGNITO_USER_POOL_CLIENT_SECRET: `"${UserPoolClient!.ClientSecret}"`,
      REST_API_ENDPOINT: `"${restApiEndpoint}"`,
      COGNITO_CALLBACK_URL: `"${COGNITO_CALLBACK_URL}"`
    }
  });

  return {
    COGNITO_CALLBACK_URL,
    USERNAME: userName,
    PASSWORD: password
  };
};

module.exports = defineConfig({
  e2e: {
    setupNodeEvents: async (_on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
      return merge(config, { env: await getEnvironmentVariables(config.env.stage ?? 'testEnv') });
    }
  },
  video: false,
  screenshotOnRunFailure: false,
  chromeWebSecurity: false // Required to allow switching origins from Cognito (HTTPS) to localhost (HTTP)
});
