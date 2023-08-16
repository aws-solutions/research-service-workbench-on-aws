# Workbench Core Authentication
## `main branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/main/graph/badge.svg?flag=workbench-core-authentication)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/main)

## `develop branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/develop/graph/badge.svg?flag=workbench-core-authentication)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/develop)

## Description

An authentication service that implements the [authorization code grant](https://aws.amazon.com/blogs/mobile/understanding-amazon-cognito-user-pool-oauth-2-0-grants/) to handle user authentication. The provided `AuthenticationPlugin` reference implementation, `CognitoAuthenticationPlugin`, uses Cognito as the backing IdP.

## Usage

### Initialization

```ts
// Initialize a CognitoAuthenticationPluginOptions object
const cognitoAuthenticationPluginOptions: CognitoAuthenticationPluginOptions = {
  cognitoDomain: '<Cognito Hosted UI Domain>',
  userPoolId: '<Cognito User Pool ID>',
  webUiClient: {
    clientId: '<Cognito User Pool Client ID for WebUI>',
    clientSecret: '<Cognito User Pool Client Secret for WebUI>',
  },
  allowedClientIds: ['<Optional Cognito User Pool ID for programmatic access>'],
  websiteUrl: '<Website URL>'
};

// Create an AuthenticationPlugin instance
const cognitoAuthenticationPlugin = new CognitoAuthenticationPlugin(cognitoAuthenticationPluginOptions);

// Create an AuthenticationService instance
const authenticationService = new AuthenticationService(cognitoAuthenticationPlugin);
```

## Integration with Express

Documentation on integrating AuthenticationService with Express can be found [here](./authenticationMiddleware.md).

## Extending AuthenticationService

`AuthenticationService` provides one `AuthenticationPlugin` reference implementation called `CognitoAuthenticationPlugin` that uses Cognito as the Identity Provider (IdP). Cognito can integrate with any OIDC compatible external IdP, but if another primary IdP is required, a custom AuthenticationPlugin can be created. A user-provided plugin must implement the `AuthenticationPlugin` interface.
