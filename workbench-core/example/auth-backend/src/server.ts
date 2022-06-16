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
import express, { Request, Response, NextFunction } from 'express';
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

// Wrapper verify token
function wrapVerifyToken(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  ignoreRoutes: string[]
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const path = req.path;
    if (ignoreRoutes.includes(path)) {
      next();
    } else {
      await fn(req, res, next);
    }
  };
}

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

app.use(wrapVerifyToken(verifyToken(authenticationService), ['/login', '/token', '/logout', '/refresh']));
app.use(withAuth(authorizationService));

app.get('/login', getAuthorizationCodeUrl(authenticationService));
app.post('/token', getTokensFromAuthorizationCode(authenticationService));
app.get('/logout', logoutUser(authenticationService));
app.get('/refresh', refreshAccessToken(authenticationService));

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
