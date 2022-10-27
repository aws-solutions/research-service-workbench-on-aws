import {
  AuthenticationService,
  CognitoAuthenticationPlugin,
  CognitoAuthenticationPluginOptions
} from '@aws/workbench-core-authentication';

const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
  cognitoDomain: process.env.COGNITO_DOMAIN!,
  userPoolId: process.env.USER_POOL_ID!,
  clientId: process.env.CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!
};

export const authenticationService: AuthenticationService = new AuthenticationService(
  new CognitoAuthenticationPlugin(cognitoPluginOptions)
);
