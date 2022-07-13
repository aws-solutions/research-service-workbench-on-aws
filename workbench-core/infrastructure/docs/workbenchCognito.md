# WorkbenchCognito CDK Construct

## Description
A CDK Construct to create a Cognito user pool for use with the [authentication package](../../authentication/). Creates a user pool, domain, app client, and (optionally) OpenID Connect(OIDC)-compatible Identity Providers (IdPs)

## Usage

### Requirements
The provided middleware and route handlers assume that the Express application is using the following middleware:

- [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- one of:
  - [built in express](https://expressjs.com/en/4x/api.html) via `express.json()` for express versions >= 4.16.0
  - [body-parser](https://www.npmjs.com/package/body-parser) for express versions < 4.16.0
- the `verifyToken` middleware is mounted at the app level with no path, as it should execute every time a request is received
- the `RoutesIgnored` object is imported from the [authorization package](../../authorization/)

#### Example
```ts
// Initialize a CognitoAuthenticationPluginOptions object
const cognitoAuthenticationPluginOptions: CognitoAuthenticationPluginOptions = {
  cognitoDomain: '<Cognito Hosted UI Domain>',
  userPoolId: '<Cognito User Pool ID>',
  clientId: '<Cognito User Pool Client ID>',
  clientSecret: '<Cognito User Pool Client Secret>',
  websiteUrl: '<Website URL>'
};

// Create an AuthenticationService instance
const authenticationService = new AuthenticationService(new CognitoAuthenticationPlugin(cognitoAuthenticationPluginOptions));

// Create a LoggingService instance
const loggingService = new LoggingService();

// Create a RoutesIgnored object.
// Routes defined here and passed into the verifyToken middleware will not be subject to authentication
const ignoredRoutes: RoutesIgnored = {
  '/login': {
    GET: true
  },
  '/token': {
    POST: true
  },
  '/logout': {
    GET: true
  },
  '/refresh': {
    GET: true
  },
  '/loggedIn': {
    GET: true
  }
};

// Create an Express app
const app = express();

// Add the cookie-parser and body-parser middlewares to the app
app.use(cookieParser());
app.use(express.json());

// Add the verifyToken middleware to the app
app.use(verifyToken(authenticationService, { ignoredRoutes, loggingService }));

// These routes are public (as defined in the ignoredRoutes object above) 
app.get('/login', getAuthorizationCodeUrl(authenticationService));
app.post('/token', getTokensFromAuthorizationCode(authenticationService, { loggingService }));
app.get('/logout', logoutUser(authenticationService, { loggingService }));
app.get('/refresh', refreshAccessToken(authenticationService, { loggingService }));
app.get('/loggedIn', isUserLoggedIn(authenticationService, { loggingService }));

// This route is not public and will need to pass authentication to access
app.get('/protected', (req, res) => {
  res.status(200).json({ user: res.locals.user });
});

app.listen(3001);
```
