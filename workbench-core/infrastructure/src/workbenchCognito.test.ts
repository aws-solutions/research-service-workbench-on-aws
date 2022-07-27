/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ProviderAttribute } from 'aws-cdk-lib/aws-cognito';
import {
  WorkbenchCognito,
  WorkbenchCognitoProps,
  WorkbenchUserPoolOidcIdentityProvider
} from './workbenchCognito';

describe('WorkbenchCognito tests', () => {
  it('has the correct user pool properties', () => {
    const workbenchCognitoProps: WorkbenchCognitoProps = {
      domainPrefix: 'test-domain',
      websiteUrl: 'https://www.example.com',
      userPoolName: 'test-user-pool'
    };
    const stack = new Stack();
    new WorkbenchCognito(stack, 'TestWorkbenchCognito', workbenchCognitoProps);
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::Cognito::UserPool', 1);
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      AccountRecoverySetting: {
        RecoveryMechanisms: [
          {
            Name: 'verified_email',
            Priority: 1
          }
        ]
      },
      AdminCreateUserConfig: {
        AllowAdminCreateUserOnly: true
      },
      AutoVerifiedAttributes: ['email'],
      MfaConfiguration: 'OFF',
      Schema: [
        {
          Mutable: true,
          Name: 'given_name',
          Required: true
        },
        {
          Mutable: true,
          Name: 'family_name',
          Required: true
        },
        {
          Mutable: true,
          Name: 'email',
          Required: true
        }
      ],
      UsernameAttributes: ['email'],
      UsernameConfiguration: {
        CaseSensitive: false
      },
      UserPoolName: workbenchCognitoProps.userPoolName
    });
  });

  it('has the correct user pool domain properties', () => {
    const workbenchCognitoProps: WorkbenchCognitoProps = {
      domainPrefix: 'test-domain',
      websiteUrl: 'https://www.example.com'
    };
    const stack = new Stack();
    new WorkbenchCognito(stack, 'TestWorkbenchCognito', workbenchCognitoProps);
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::Cognito::UserPoolDomain', 1);
    template.hasResourceProperties('AWS::Cognito::UserPoolDomain', {
      Domain: workbenchCognitoProps.domainPrefix
    });
  });

  it('has the correct user pool client properties', () => {
    const workbenchCognitoProps: WorkbenchCognitoProps = {
      domainPrefix: 'test-domain',
      websiteUrl: 'https://www.example.com',
      userPoolClientName: 'test-user-pool-client'
    };
    const stack = new Stack();
    new WorkbenchCognito(stack, 'TestWorkbenchCognito', workbenchCognitoProps);
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);
    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
      AllowedOAuthFlows: ['code'],
      AllowedOAuthFlowsUserPoolClient: true,
      AllowedOAuthScopes: ['openid'],
      CallbackURLs: [workbenchCognitoProps.websiteUrl],
      EnableTokenRevocation: true,
      GenerateSecret: true,
      LogoutURLs: [workbenchCognitoProps.websiteUrl],
      PreventUserExistenceErrors: 'ENABLED'
    });
  });

  it('has the correct user pool idp properties when provided', () => {
    const oidcProvider1: WorkbenchUserPoolOidcIdentityProvider = {
      clientId: 'fake-id-1',
      clientSecret: 'fake-secret-1',
      issuerUrl: 'https://www.example-idp-1.com',
      name: 'test-provider-1',
      attributeMapping: {
        givenName: ProviderAttribute.other('given_name-1'),
        familyName: ProviderAttribute.other('family_name-1'),
        email: ProviderAttribute.other('email-1')
      }
    };
    const oidcProvider2: WorkbenchUserPoolOidcIdentityProvider = {
      clientId: 'fake-id-2',
      clientSecret: 'fake-secret-2',
      issuerUrl: 'https://www.example-idp-2.com',
      name: 'test-provider-2',
      attributeMapping: {
        givenName: ProviderAttribute.other('given_name-2'),
        familyName: ProviderAttribute.other('family_name-2'),
        email: ProviderAttribute.other('email-2')
      }
    };
    const workbenchCognitoProps: WorkbenchCognitoProps = {
      domainPrefix: 'test-domain',
      websiteUrl: 'https://www.example.com',
      oidcIdentityProviders: [oidcProvider1, oidcProvider2]
    };
    const stack = new Stack();
    new WorkbenchCognito(stack, 'TestWorkbenchCognito', workbenchCognitoProps);
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::Cognito::UserPoolIdentityProvider', 2);
    template.hasResourceProperties('AWS::Cognito::UserPoolIdentityProvider', {
      ProviderName: oidcProvider1.name,
      ProviderType: 'OIDC',
      AttributeMapping: {
        email: 'email-1',
        given_name: 'given_name-1',
        family_name: 'family_name-1'
      },
      ProviderDetails: {
        client_id: oidcProvider1.clientId,
        client_secret: oidcProvider1.clientSecret,
        authorize_scopes: 'openid profile email',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        attributes_request_method: 'GET',
        oidc_issuer: oidcProvider1.issuerUrl
      }
    });
    template.hasResourceProperties('AWS::Cognito::UserPoolIdentityProvider', {
      ProviderName: oidcProvider2.name,
      ProviderType: 'OIDC',
      AttributeMapping: {
        email: 'email-2',
        given_name: 'given_name-2',
        family_name: 'family_name-2'
      },
      ProviderDetails: {
        client_id: oidcProvider2.clientId,
        client_secret: oidcProvider2.clientSecret,
        authorize_scopes: 'openid profile email',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        attributes_request_method: 'GET',
        oidc_issuer: oidcProvider2.issuerUrl
      }
    });
  });
});
