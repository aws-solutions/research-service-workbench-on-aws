# Workbench Core Infrastructure

## Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-100%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-100%25-brightgreen.svg?style=flat) |

## Description
Workbench core components are designed to work with existing infrastructure when available. When infrastructure is not available this package is here to help. This package serves two purposes. First, to help fill in the gaps where organizations are diverging from reference infrastructure, but still need to deploy a few elements. Second, to assist solution developers by providing easy to configure CDK style constructs which can be used as infrastructure building blocks in their solutions.

## Components
### WorkbenchCognito
The WorkbenchCognito component is a CDK construct which deploys an AWS Cognito User Pool. The User Pool will be initialized with a client application for the website URL provided in the properties. One may also initialized one or more OIDC provider configurations to allow for alternate single sign on providers to be utilized using the `workbench-core-authentication` package's Cognito interface. 

## Usage
First, install the package in your solution using your prefered package manager.
```bash
npm -i @aws/workbench-core-infrastructure
```

Import the 
```typescript
import { WorkbenchCognito, WorkbenchCognitoProps } from '@aws/workbench-core-infrastructure'
// import the OidcProvider properties interface if including a SSO component.
// import { WorkbenchUserPoolOidcIdentityProvider } from '@aws/workbench-core-infrastructure'
```

Next, set the properties and initialize the construct.

```typescript
// ...
// within a CDK app or construct

// set the cognito properites.
// If a user pool name or user pool client name are not provided, CDK will generate them for you.
const cognitoProps: WorkbenchCognitoProps = {
  domainPrefix = 'myDomainPrefix',
  websiteUrl = 'https://mysite.mydomain.com',
  // oidcIdentityProviders = [ myWorkbenchUserPoolOidcIdentityProviderConfig ]
};

this.myWorkbenchCognito = new WorkbenchCognito(this, 'my-workbench-cognito', cognitoProps);

// ...
// the rest of your app/construct code.
```

Now build and deploy.

