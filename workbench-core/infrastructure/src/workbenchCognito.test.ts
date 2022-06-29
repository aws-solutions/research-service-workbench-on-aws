import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WorkbenchCognito, WorkbenchCognitoProps } from './workbenchCognito';

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
});
