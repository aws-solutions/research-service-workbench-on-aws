/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AuthenticationService,
  CognitoAuthenticationPlugin,
  CognitoAuthenticationPluginOptions
} from '@aws/workbench-core-authentication';

const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
  cognitoDomain: process.env.COGNITO_DOMAIN!,
  webUiAppClient: {
    userPoolId: process.env.USER_POOL_ID!,
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!
  }
};

export const authenticationService: AuthenticationService = new AuthenticationService(
  new CognitoAuthenticationPlugin(cognitoPluginOptions)
);
