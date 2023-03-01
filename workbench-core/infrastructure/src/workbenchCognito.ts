/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Duration, RemovalPolicy, SecretValue } from 'aws-cdk-lib';
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
import { Construct } from 'constructs';
import { cloneDeep } from 'lodash';
import merge from 'lodash/merge';

const userPoolDefaults: UserPoolProps = {
  accountRecovery: AccountRecovery.EMAIL_ONLY,
  enableSmsRole: false,
  mfa: Mfa.OPTIONAL,
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
  },
  mfaSecondFactor: {
    sms: false,
    otp: true
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
  authFlows: {
    userSrp: true,
    userPassword: true,
    custom: true
  },
  preventUserExistenceErrors: true,
  enableTokenRevocation: true,
  idTokenValidity: Duration.minutes(15),
  accessTokenValidity: Duration.minutes(15),
  refreshTokenValidity: Duration.days(7)
};

export interface WorkbenchCognitoProps {
  domainPrefix: string;
  websiteUrls: string[];
  userPoolName?: string;
  webUiUserPoolClientName?: string;
  programmaticAccessUserPoolName?: string;
  oidcIdentityProviders?: WorkbenchUserPoolOidcIdentityProvider[];
  accessTokenValidity?: Duration;
  idTokenValidity?: Duration;
  refreshTokenValidity?: Duration;
  mfa?: Mfa;
  removalPolicy?: RemovalPolicy;
}

export interface WorkbenchUserPoolOidcIdentityProvider
  extends Omit<UserPoolIdentityProviderOidcProps, 'userPool' | 'scopes'> {}

export class WorkbenchCognito extends Construct {
  public readonly userPool: UserPool;
  public readonly webUiUserPoolClient: UserPoolClient;
  public readonly programmaticAccessUserPoolClient: UserPoolClient;
  public readonly userPoolDomain: UserPoolDomain;

  public readonly cognitoDomain: string;
  public readonly userPoolId: string;
  public readonly webUiUserPoolClientId: string;
  public readonly webUiUserPoolClientSecret: SecretValue;
  public readonly programmaticAccessUserPoolClientId: string;

  public constructor(scope: Construct, id: string, props: WorkbenchCognitoProps) {
    const {
      domainPrefix,
      websiteUrls,
      webUiUserPoolClientName,
      programmaticAccessUserPoolName,
      oidcIdentityProviders: oidcIdentityProviderProps
    } = props;
    super(scope, id);

    const tempUserPoolProps: UserPoolProps = {
      mfa: props.mfa,
      userPoolName: props.userPoolName,
      removalPolicy: props.removalPolicy
    };

    const userPoolProps = merge(cloneDeep(userPoolDefaults), tempUserPoolProps);

    this.userPool = new UserPool(this, 'WorkbenchUserPool', userPoolProps);

    this.userPoolDomain = new UserPoolDomain(this, 'WorkbenchUserPoolDomain', {
      userPool: this.userPool,
      cognitoDomain: { domainPrefix: domainPrefix }
    });

    oidcIdentityProviderProps?.forEach((props, index) => {
      const provider = new UserPoolIdentityProviderOidc(
        this,
        `WorkbenchUserPoolIdentityProviderOidc${index}`,
        {
          ...props,
          userPool: this.userPool,
          scopes: ['openid', 'profile', 'email']
        }
      );
      this.userPool.registerIdentityProvider(provider);
    });

    const tempUserPoolClientProps: UserPoolClientOptions = {
      oAuth: {
        callbackUrls: websiteUrls,
        logoutUrls: websiteUrls
      },
      generateSecret: true,
      accessTokenValidity: props.accessTokenValidity,
      idTokenValidity: props.idTokenValidity,
      refreshTokenValidity: props.refreshTokenValidity
    };
    const userPoolClientProps = merge(cloneDeep(userPoolClientDefaults), tempUserPoolClientProps);
    this.webUiUserPoolClient = new UserPoolClient(this, 'WorkbenchUserPoolClient-webUi', {
      ...userPoolClientProps,
      userPool: this.userPool,
      userPoolClientName: webUiUserPoolClientName
    });

    const tempIntegrationTestUserPoolClientProps: UserPoolClientOptions = {
      authFlows: {
        adminUserPassword: true
      }
    };
    merge(userPoolClientProps, tempIntegrationTestUserPoolClientProps);
    this.programmaticAccessUserPoolClient = new UserPoolClient(this, 'WorkbenchUserPoolClient-iTest', {
      ...userPoolClientProps,
      userPool: this.userPool,
      userPoolClientName: programmaticAccessUserPoolName
    });
    this.userPool.identityProviders.forEach((provider) => {
      this.webUiUserPoolClient.node.addDependency(provider);
      this.programmaticAccessUserPoolClient.node.addDependency(provider);
    });

    this.cognitoDomain = this.userPoolDomain.baseUrl();
    this.userPoolId = this.userPool.userPoolId;
    this.webUiUserPoolClientId = this.webUiUserPoolClient.userPoolClientId;
    this.programmaticAccessUserPoolClientId = this.programmaticAccessUserPoolClient.userPoolClientId;
    this.webUiUserPoolClientSecret = this.webUiUserPoolClient.userPoolClientSecret;
  }
}
