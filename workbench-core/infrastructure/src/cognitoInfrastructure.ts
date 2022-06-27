import {
  AccountRecovery,
  IUserPoolIdentityProvider,
  Mfa,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientOptions,
  UserPoolDomain,
  UserPoolProps
} from 'aws-cdk-lib/aws-cognito';
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
  authFlows: {
    adminUserPassword: true,
    custom: true,
    userSrp: true
  },
  oAuth: {
    flows: {
      authorizationCodeGrant: true
    },
    scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PHONE]
  },
  preventUserExistenceErrors: true,
  enableTokenRevocation: true
};

export interface WorkbenchCognitoProps {
  domainPrefix: string;
  websiteUrl: string;
  userPoolName?: string;
  identityProviders?: IUserPoolIdentityProvider[];
}

export class WorkbenchCognito extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  public readonly userPoolDomain: UserPoolDomain;

  public constructor(scope: Construct, id: string, props: WorkbenchCognitoProps) {
    const { domainPrefix, websiteUrl, userPoolName, identityProviders } = props;
    super(scope, id);

    this.userPool = new UserPool(this, 'WorkbenchUserPool', { ...userPoolDefaults, userPoolName });

    this.userPoolDomain = new UserPoolDomain(this, 'WorkbenchUserPoolDomain', {
      userPool: this.userPool,
      cognitoDomain: { domainPrefix: domainPrefix }
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

    identityProviders?.forEach((provider) => this.userPool.registerIdentityProvider(provider));
  }
}
