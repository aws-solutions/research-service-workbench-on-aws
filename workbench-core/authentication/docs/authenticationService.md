# Authentication Service

## Description

An authentication service that implements the [authorization code grant](https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-user-pool-oauth-2-0-grants/) to handle user authentication. The provided `AuthenticationPlugin` reference implementation, `CognitoAuthenticationPlugin`, uses Cognito as the backing IdP.

## Usage

### Initialization

```ts
// Initialize a CognitoAuthenticationPluginOptions object
const cognitoAuthenticationPluginOptions: CognitoAuthenticationPluginOptions = {
  cognitoDomain: '<Cognito Hosted UI Domain>',
  userPoolId: '<Cognito User Pool ID>',
  clientId: '<Cognito User Pool Client ID>',
  clientSecret: '<Cognito User Pool Client Secret>',
  websiteUrl: '<Website URL>'
};

// Create an AuthenticationPlugin instance
const cognitoAuthenticationPlugin = new CognitoAuthenticationPlugin(cognitoAuthenticationPluginOptions);

// Create an AuthenticationService instance
const authenticationService = new AuthenticationService(cognitoAuthenticationPlugin);
```

## Integration with Express

### Requirements
- the Express application is using the following middleware:
  - [cookie-parser](https://www.npmjs.com/package/cookie-parser)
  - one of:
    - [built in express](https://expressjs.com/en/4x/api.html) via `express.json()` for express versions >= 4.16.0
    - [body-parser](https://www.npmjs.com/package/body-parser) for express versions < 4.16.0
- the `RoutesIgnored` object is imported from authorization package TODO add package name
- the `verifyToken` middleware is mounted at the app level with no path, as it should execute every time a request is received

More detailed information on the provided authentication middleware and route handlers can be found [here](./authenticationMiddleware.md).

### Initialization

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

## Extending AuthenticationService

`AuthenticationService` provides one `AuthenticationPlugin` reference implementation called `CognitoAuthenticationPlugin` that uses Cognito as the Identity Provider (IdP). Cognito can integrate with any OIDC compatible external IdP, but if another primary IdP is required, a custom AuthenticationPlugin can be created. A user-provided plugin must implement the `AuthenticationPlugin` interface.