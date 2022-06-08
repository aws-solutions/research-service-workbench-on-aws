import {
  AccountRecovery,
  Mfa,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientOptions,
  UserPoolClientProps,
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
  signInCaseSensitive: false
};

/**
 * Defines a Cognito User Pool with Workbech defaults
 */
export class WorkbenchUserPool extends UserPool {
  /**
   *
   * @param scope - the scope of the user pool
   * @param id - the id of the user pool
   * @param props - the {@link UserPoolProps} object
   */
  public constructor(scope: Construct, id: string, props?: UserPoolProps) {
    const completeProps = merge(props, userPoolDefaults);

    super(scope, id, completeProps);
  }
}

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

/**
 * Defines a Cognito User Pool Client with Workbech defaults
 */
export class WorkbenchUserPoolClient extends UserPoolClient {
  /**
   *
   * @param scope - the scope of the user pool
   * @param id - the id of the user pool
   * @param props - the {@link UserPoolClientProps} object
   */
  public constructor(scope: Construct, id: string, props: UserPoolClientProps) {
    const completeProps = merge(props, userPoolClientDefaults);

    super(scope, id, completeProps);
  }
}
