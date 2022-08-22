# WorkbenchCognito CDK Construct

## Description
A CDK Construct to create a Cognito user pool for use with the [authentication package](../../authentication/). The construct creates a user pool, a domain, an app client, and (optionally) one or more OpenID Connect(OIDC)-compatible Identity Providers (IdPs)

## Usage

### Installing the package

Using NPM: 
```bash
npm install @aws/workbench-core-infrastructure
```

Using Yarn: 
```bash
yarn add @aws/workbench-core-infrastructure
```

### Example
```ts
// Import the construct and properties interface
import { WorkbenchCognito, WorkbenchCognitoProps } from '@aws/workbench-core-infrastructure';
// Use the imports below if including a SSO component
import { WorkbenchUserPoolOidcIdentityProvider } from '@aws/workbench-core-infrastructure';
import { ProviderAttribute } from 'aws-cdk-lib/aws-cognito';

// ...
// Within a CDK app or construct

// Create an OidcProvider if including a SSO component
const myWorkbenchUserPoolOidcIdentityProvider: WorkbenchUserPoolOidcIdentityProvider = {
  name: 'publicNameForProvider',
  clientId: 'providerClientId',
  clientSecret: 'providerClientSecret',
  issuerUrl: 'providerIssuerUrl',
  attributeMapping: {
    // These attributes are used by workbench-core-authentication package
    email: ProviderAttribute.other('providerEmailAttributeValue'),
    givenName: ProviderAttribute.other('providerGivenNameAttributeValue'),
    familyName: ProviderAttribute.other('providerFamilyNameAttributeValue'),
  }
}

// Set the cognito properites
// If a user pool name or user pool client name are not provided, CDK will generate them for you
const cognitoProps: WorkbenchCognitoProps = {
  domainPrefix: 'myDomainPrefix',
  websiteUrls: ['https://mysite.mydomain.com'],
  // Include your created OidcProvider if including a SSO component
  oidcIdentityProviders = [ myWorkbenchUserPoolOidcIdentityProvider ]
  // If an access token validity of 15 minutes is insufficient, you may change it here
  accessTokenValidity: Duration.minutes(60) // 1 hour
};

this.myWorkbenchCognito = new WorkbenchCognito(this, 'my-workbench-cognito', cognitoProps);

// ...
// The rest of your app/construct code
```