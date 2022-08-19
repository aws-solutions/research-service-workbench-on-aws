# WorkbenchCognito CDK Construct

## Description
A CDK Construct to create a Cognito user pool for use with the [authentication package](../../authentication/). Creates a user pool, domain, app client, and (optionally) OpenID Connect(OIDC)-compatible Identity Providers (IdPs)

The WorkbenchCognito component is a CDK construct which deploys an AWS Cognito User Pool. The User Pool will be initialized with a client application for the website URL provided in the properties. One may also initialized one or more OIDC provider configurations to allow for alternate single sign on providers to be utilized using the `workbench-core-authentication` package's Cognito interface. 

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
};

this.myWorkbenchCognito = new WorkbenchCognito(this, 'my-workbench-cognito', cognitoProps);

// ...
// The rest of your app/construct code
```