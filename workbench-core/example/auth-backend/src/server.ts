import {
  AuthenticationService,
  CognitoAuthenticationPlugin,
  CognitoAuthenticationPluginOptions,
  getAuthorizationCodeUrl,
  getTokensFromAuthorizationCode,
  isUserLoggedIn,
  logoutUser,
  refreshAccessToken,
  verifyToken
} from '@amzn/workbench-core-authentication';
import {
  AuthorizationService,
  CASLAuthorizationPlugin,
  PermissionsMap,
  RoutesIgnored,
  RoutesMap,
  StaticPermissionsPlugin,
  withAuth
} from '@amzn/workbench-core-authorization';
import { LoggingService } from '@amzn/workbench-core-logging';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as StaticPermissionsConfig from './staticPermissionsConfig';
import * as StaticRoutesConfig from './staticRouteConfig';

// eslint-disable-next-line @rushstack/typedef-var
const app = express();

const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
  region: '<AWS Region>',
  cognitoDomain: '<Cognito Hosted UI Domain>',
  userPoolId: '<Cognito User Pool ID>',
  clientId: '<Cognito User Pool Client ID>',
  clientSecret: '<Cognito User Pool Client Secret>',
  websiteUrl: 'http://localhost:3000'
};

// Create Logger Service
const logger: LoggingService = new LoggingService();

const authenticationService: AuthenticationService = new AuthenticationService(
  new CognitoAuthenticationPlugin(cognitoPluginOptions)
);

// Create Authorization Service
const staticPermissionsMap: PermissionsMap = StaticPermissionsConfig.permissionsMap;
const staticRoutesMap: RoutesMap = StaticRoutesConfig.routesMap;
const staticRoutesIgnored: RoutesIgnored = StaticRoutesConfig.routesIgnored;
const staticPermissionsPlugin: StaticPermissionsPlugin = new StaticPermissionsPlugin(
  staticPermissionsMap,
  staticRoutesMap,
  staticRoutesIgnored,
  logger
);
const caslAuthorizationsPlugin: CASLAuthorizationPlugin = new CASLAuthorizationPlugin();
const authorizationService: AuthorizationService = new AuthorizationService(
  caslAuthorizationsPlugin,
  staticPermissionsPlugin
);

app.use(cookieParser());
app.use(express.json());

app.use(verifyToken(authenticationService, { ignoredRoutes: staticRoutesIgnored, loggingService: logger }));
app.use(withAuth(authorizationService));

app.get('/login', getAuthorizationCodeUrl(authenticationService));
app.post('/token', getTokensFromAuthorizationCode(authenticationService, { loggingService: logger }));
app.get('/logout', logoutUser(authenticationService, { loggingService: logger }));
app.get('/refresh', refreshAccessToken(authenticationService, { loggingService: logger }));
app.get('/loggedIn', isUserLoggedIn(authenticationService, { loggingService: logger }));

app.get('/pro', (req, res) => {
  res.status(200).json({ user: res.locals.user });
});

app.get('/guest', (req, res) => {
  res.status(200).json({ message: 'Guest successfully accessed' });
});

app.get('/admin', (req, res) => {
  res.status(200).json({ message: 'Admin successfully accessed' });
});

app.listen(3001);
