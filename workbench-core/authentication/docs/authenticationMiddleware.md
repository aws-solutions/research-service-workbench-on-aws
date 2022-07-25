# Authentication Middleware

## Description
Express middleware and route handlers for basic authentication flow. Read the [Authentication Service](./authenticationService.md) documentation before exploring middleware.

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

## Functions
- [getAuthorizationCodeUrl](#getauthorizationcodeurl)  
- [getTokensFromAuthorizationCode](#gettokensfromauthorizationcode)  
- [verifyToken](#verifytoken)  
- [refreshAccessToken](#refreshaccesstoken)  
- [logoutUser](#logoutuser)

### getAuthorizationCodeUrl
This route handler is used to get the url to the authentication hosted UI.
The `stateVerifier` and `codeChallenge` request query parameters are temporary values passed in by the client. The client will replace these values later in order to keep them a client secret.

#### Assumptions
- a url request query parameter named `stateVerifier` that holds a temporary state value
- a url request query parameter named `codeChallenge` that holds a temporary pkce code challenge value

#### Parameters
- authenticationService: a configured AuthenticationService instance

#### Example
```ts
app.get('codeUrl', getAuthorizationCodeUrl(authenticationService));
```

### getTokensFromAuthorizationCode
This route handler is used to exchange the authorization code received from the authentication server for authentication tokens.
This route places the access token and refresh token, if it exists, into http only, secure, same site strict cookies and returns the id token in the response body.

#### Assumptions
- a url request body parameter named `code` that holds the authorization code
- a url request body parameter named `codeVerifier` that holds a pkce code verifier value

#### Parameters
- authenticationService: a configured AuthenticationService instance
- options:
  - loggingService: an optional LoggingService instance. If included errors from the AuthenticationService will be logged here

#### Example
```ts
const loggingService = new LoggingService();
app.get('tokens', getTokensFromAuthorizationCode(authenticationService, { loggingService }));
```

### verifyToken
This middleware is used to authenticate a user from its access token.
If authenticated, the user's id and roles will be stored in `res.locals.user`

#### Assumptions
- the access token is stored in a cookie named `access_token`

#### Parameters
- authenticationService: a configured AuthenticationService instance
- options:
  - loggingService: an optional LoggingService instance. If included, errors from the AuthenticationService will be logged here
  - ignoredRoutes: an optional RoutesIgnored object. If included, routes defined here will be ignored by this middleware

#### Example
```ts
const loggingService = new LoggingService();
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

app.use(verifyToken(authenticationService, { loggingService, ignoredRoutes }))
app.get('protectedRoute', (req, res) => res.sendStatus(200));
```

### refreshAccessToken
This route handler used to refresh an expired access code.

#### Assumptions
- the access token is stored in a cookie named `access_token`

#### Parameters
- authenticationService: a configured AuthenticationService instance
- options:
  - loggingService: an optional LoggingService instance. If included errors from the AuthenticationService will be logged here

#### Example
```ts
const loggingService = new LoggingService();
app.get('refresh', refreshAccessToken(authenticationService, { loggingService }));
```

### logoutUser
This route handler is used to logout a user.

#### Assumptions
- the access token is stored in a cookie named `access_token`
- if there is a refresh token, it is stored in a cookie named `refresh_token`

#### Parameters
- authenticationService: a configured AuthenticationService instance
- options:
  - loggingService: an optional LoggingService instance. If included errors from the AuthenticationService will be logged here

#### Example
```ts
const loggingService = new LoggingService();
app.get('logout', logoutUser(authenticationService, { loggingService }));
```

### isUserLoggedIn
This route handler is used to check if the user making the request is logged in.

#### Assumptions
- if there is a access token, it is stored in a cookie named `access_token`
- if there is a refresh token, it is stored in a cookie named `refresh_token`

#### Parameters
- authenticationService: a configured AuthenticationService instance
- options:
  - loggingService: an optional LoggingService instance. If included errors from the AuthenticationService will be logged here

#### Example
```ts
const loggingService = new LoggingService();
app.get('loggedIn', isUserLoggedIn(authenticationService, { loggingService }));
```
