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
  userPoolId: process.env.USER_POOL_ID!,
  webUiClient: {
    clientId: process.env.WEB_UI_CLIENT_ID!,
    clientSecret: process.env.WEB_UI_CLIENT_SECRET!
  },
  allowedClientIds: [process.env.PROGRAMMATIC_ACCESS_CLIENT_ID!]
};

export const authenticationService: AuthenticationService = new AuthenticationService(
  new CognitoAuthenticationPlugin(cognitoPluginOptions)
);
