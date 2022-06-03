import {
  AccountRecovery,
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolClientOptions,
  UserPoolClientProps,
  UserPoolProps
} from 'aws-cdk-lib/aws-cognito';
import { RemovalPolicy } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

import merge from 'lodash/merge';

const userPoolDefaults: UserPoolProps = {};

export class WorkbenchUserPool extends UserPool {
  public constructor(scope: Construct, id: string, props?: UserPoolProps) {
    const completeProps = merge(props, userPoolDefaults);

    super(scope, id, completeProps);
  }
}

const userPoolClientDefaults: UserPoolClientOptions = {
  generateSecret: true,
  authFlows: {
    // TODO
  },
  oAuth: {
    flows: {
      authorizationCodeGrant: true
    }, // TODO callback and logout URLSs?
    scopes: [OAuthScope.OPENID, OAuthScope.EMAIL, OAuthScope.PHONE]
  },
  preventUserExistenceErrors: true,
  enableTokenRevocation: true
};

export class WorkbenchUserPoolClient extends UserPoolClient {
  public constructor(scope: Construct, id: string, props: UserPoolClientProps) {
    const completeProps = merge(props, userPoolClientDefaults);

    super(scope, id, completeProps);
  }
}
