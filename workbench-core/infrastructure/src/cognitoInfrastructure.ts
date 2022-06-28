import {
  AccountRecovery,
  Mfa,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientOptions,
  UserPoolDomain,
  UserPoolIdentityProviderOidc,
  UserPoolIdentityProviderOidcProps,
  UserPoolProps
} from 'aws-cdk-lib/aws-cognito';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { CfnOutput, SecretValue, Stack } from 'aws-cdk-lib/core';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import merge from 'lodash/merge';

const userPoolDefaults: UserPoolProps = {
  accountRecovery: AccountRecovery.EMAIL_ONLY,
  enableSmsRole: false,
  mfa: Mfa.OFF,
  selfSignUpEnabled: false, // only admin can create users
  signInAliases: {
    // only sign in with email
    username: false,
    email: true
  },
  signInCaseSensitive: false,
  standardAttributes: {
    givenName: {
      required: true
    },
    familyName: {
      required: true
    },
    email: {
      required: true
    }
  }
};

const userPoolClientDefaults: UserPoolClientOptions = {
  generateSecret: true,
  oAuth: {
    flows: {
      authorizationCodeGrant: true
    },
    scopes: [OAuthScope.OPENID]
  },
  preventUserExistenceErrors: true,
  enableTokenRevocation: true
};

export interface WorkbenchCognitoProps {
  domainPrefix: string;
  websiteUrl: string;
  userPoolName?: string;
  oidcIdentityProviders?: WorkbenchUserPoolOidcIdentityProvider[];
}

export interface WorkbenchUserPoolOidcIdentityProvider
  extends Omit<UserPoolIdentityProviderOidcProps, 'userPool'> {}

export class WorkbenchCognito extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  public readonly userPoolDomain: UserPoolDomain;

  public constructor(scope: Construct, id: string, props: WorkbenchCognitoProps) {
    const {
      domainPrefix,
      websiteUrl,
      userPoolName,
      oidcIdentityProviders: oidcIdentityProviderProps
    } = props;
    super(scope, id);

    const region = Stack.of(this).region;

    this.userPool = new UserPool(this, 'WorkbenchUserPool', { ...userPoolDefaults, userPoolName });

    this.userPoolDomain = new UserPoolDomain(this, 'WorkbenchUserPoolDomain', {
      userPool: this.userPool,
      cognitoDomain: { domainPrefix: domainPrefix }
    });

    oidcIdentityProviderProps?.forEach((props) => {
      const provider = new UserPoolIdentityProviderOidc(this, 'WorkbenchUserPoolIdentityProviderOidc', {
        ...props,
        userPool: this.userPool,
        scopes: ['openid', 'profile', 'email']
      });
      this.userPool.registerIdentityProvider(provider);
    });

    const tempProps: UserPoolClientOptions = {
      oAuth: {
        callbackUrls: [websiteUrl],
        logoutUrls: [websiteUrl]
      }
    };
    const userPoolClientProps = merge(userPoolClientDefaults, tempProps);
    this.userPoolClient = new UserPoolClient(this, 'WorkbenchUserPoolClient', {
      ...userPoolClientProps,
      userPool: this.userPool
    });

    this.userPool.identityProviders.forEach((provider) => this.userPoolClient.node.addDependency(provider));

    const describeCognitoUserPoolClient = new AwsCustomResource(this, 'DescribeCognitoUserPoolClient', {
      resourceType: 'Custom::DescribeCognitoUserPoolClient',
      onCreate: {
        region,
        service: 'CognitoIdentityServiceProvider',
        action: 'describeUserPoolClient',
        parameters: {
          UserPoolId: this.userPool.userPoolId,
          ClientId: this.userPoolClient.userPoolClientId
        },
        physicalResourceId: PhysicalResourceId.of(this.userPoolClient.userPoolClientId)
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: [this.userPool.userPoolArn]
      })
    });

    const userPoolClientSecret = describeCognitoUserPoolClient.getResponseField(
      'UserPoolClient.ClientSecret'
    );

    new CfnOutput(this, 'WorkbenchUserPoolDomainName', { value: this.userPoolDomain.baseUrl() });
    new CfnOutput(this, 'WorkbenchUserPoolId', { value: this.userPool.userPoolId });
    new CfnOutput(this, 'WorkbenchUserPoolClientId', { value: this.userPoolClient.userPoolClientId });
    new Secret(this, 'WorkbenchUserPoolClientSecret', {
      secretName: 'WorkbenchUserPoolClientSecret',
      secretStringValue: SecretValue.unsafePlainText(userPoolClientSecret)
    });
  }
}
