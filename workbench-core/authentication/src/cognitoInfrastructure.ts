import {
  AccountRecovery,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolClientProps,
  UserPoolProps
} from 'aws-cdk-lib/aws-cognito';
import { RemovalPolicy } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

export class WorkbenchUserPool {
  public constructor(scope: Construct, id: string, props?: UserPoolProps & UserPoolClientProps) {
    const userPool = new UserPool(scope, 'ExampleUserPool', {
      userPoolName: `example-user-pool`,
      removalPolicy: RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true
      },
      autoVerify: {
        email: true
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: true,
        requireSymbols: true
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY
    });

    const userPoolClient = new UserPoolClient(scope, 'ExampleUserPoolClient', {
      userPool,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        custom: true,
        userSrp: true
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO]
    });
  }
}
