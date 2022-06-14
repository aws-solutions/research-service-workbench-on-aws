import {
  AuthenticationService,
  CognitoAuthenticationPlugin,
  CognitoAuthenticationPluginOptions,
  getAuthorizationCodeUrl,
  getTokensFromAuthorizationCode,
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
  region: 'TODO',
  cognitoDomain: 'TODO',
  userPoolId: 'TODO',
  clientId: 'TODO',
  clientSecret: 'TODO',
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

app.get('/login', getAuthorizationCodeUrl(authenticationService));
app.post('/token', getTokensFromAuthorizationCode(authenticationService));
app.get('/logout', logoutUser(authenticationService));
app.get('/refresh', refreshAccessToken(authenticationService));
app.get('/pro', verifyToken(authenticationService), (req, res) => {
  res.status(200).json({ user: res.locals.user });
});

app.use(withAuth(authorizationService));

app.listen(3001);
