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
import cookieParser from 'cookie-parser';
import express from 'express';

const app = express();

const cognitoPluginOptions: CognitoAuthenticationPluginOptions = {
  region: 'TODO',
  cognitoDomain: 'TODO',
  userPoolId: 'TODO',
  clientId: 'TODO',
  clientSecret: 'TODO',
  websiteUrl: 'http://localhost:3000'
};

const service = new AuthenticationService(new CognitoAuthenticationPlugin(cognitoPluginOptions));

app.use(cookieParser());
app.use(express.json());

app.get('/login', getAuthorizationCodeUrl(service));
app.post('/token', getTokensFromAuthorizationCode(service));
app.get('/logout', logoutUser(service));
app.get('/refresh', refreshAccessToken(service));
app.get('/pro', verifyToken(service), (req, res) => {
  res.status(200).json({ user: res.locals.user });
});

app.listen(3001);
