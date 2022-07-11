# Authentication Middleware

## Description
Express middleware and route handlers for basic authentication flow.

## Usage

### Requirements
The provided middleware and route handlers assume that the Express application is using the following middleware:

- [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- one of:
  - [built in express](https://expressjs.com/en/4x/api.html) via `express.json()` for express versions >= 4.16.0
  - [body-parser](https://www.npmjs.com/package/body-parser) for express versions < 4.16.0

#### Example
```ts
const app = express();

app.use(cookieParser());
app.use(express.json())
```

## Functions
[getAuthorizationCodeUrl](#getauthorizationcodeurl)  
[getTokensFromAuthorizationCode](#gettokensfromauthorizationcode)  
[verifyToken](#verifytoken)  
[refreshAccessToken](#refreshaccesstoken)  
[logoutUser](#logoutuser)

### getAuthorizationCodeUrl
This route handler is used to get the url to the authentication hosted UI.
The `stateVerifier` and `codeChallenge` request query parameters are temporary values passed in by the client. The client will replace these values later in order to keep them a client secret.

#### Assumptions
- a request query parameter named `stateVerifier` that holds a temporary state value
- a request query parameter named `codeChallenge` that holds a temporary pkce code challenge value

#### Example
```ts
app.get('codeUrl', getAuthorizationCodeUrl(authenticationService));
```

### getTokensFromAuthorizationCode
This route handler is used to exchange the authorization code received from the authentication server for authentication tokens.
This route places the access token and refresh token, if it exists, into http only, secure, same site strict cookies and returns the id token in the response body.

#### Assumptions
- a request body parameter named `code` that holds the authorization code
- a request body parameter named `codeVerifier` that holds a pkce code verifier value

#### Example
```ts
app.get('tokens', getTokensFromAuthorizationCode(authenticationService));
```

### verifyToken
This middleware is used to authenticate a user from its access token.
If authenticated, the user's id and roles will be stored in `res.locals.user`

#### Assumptions

- the access token is stored in a cookie named `access_token`

#### Example
```ts
app.use(verifyToken(authenticationService))
app.get('protectedRoute', (req, res) => res.sendStatus(200));
```

### refreshAccessToken
This route handler used to refresh an expired access code.

#### Assumptions
- the access token is stored in a cookie named `access_token`

#### Example
```ts
app.get('refresh', refreshAccessToken(authenticationService));
```

### logoutUser
This route handler is used to logout a user.

#### Assumptions
- the access token is stored in a cookie named `access_token`
- if there is a refresh token, it is stored in a cookie named `refresh_token`

#### Example
```ts
app.get('logout', logoutUser(authenticationService));
```

### isUserLoggedIn
This route handler is used to check if the user making the request is logged in.

#### Assumptions
- if there is a access token, it is stored in a cookie named `access_token`
- if there is a refresh token, it is stored in a cookie named `refresh_token`

#### Example
```ts
app.get('loggedIn', isUserLoggedIn(authenticationService));
```
