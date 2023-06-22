/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@aws/workbench-core-base';
import { Output } from '@aws-sdk/client-cloudformation';
import { UsernameExistsException } from '@aws-sdk/client-cognito-identity-provider';
import passwordGenerator from 'generate-password';

export default class CognitoSetup {
  private _aws: AwsService;
  private _constants: {
    AWS_REGION: string;
    ROOT_USER_EMAIL: string;
    USER_POOL_NAME: string;
    STACK_NAME: string;
  };

  public constructor(constants: {
    AWS_REGION: string;
    ROOT_USER_EMAIL: string;
    USER_POOL_NAME: string;
    STACK_NAME: string;
  }) {
    this._constants = constants;

    const { AWS_REGION } = constants;
    this._aws = new AwsService({ region: AWS_REGION });
  }

  public async run(): Promise<void> {
    const { USER_POOL_NAME, ROOT_USER_EMAIL } = this._constants;

    const userPoolId = await this.getUserPoolId();
    console.log(`User pool id: ${userPoolId}`);

    // Create root user in user pool if user does not exist in pool
    try {
      await this.adminCreateUser();
      console.log('Creating new user because user does not exist');
      console.log(
        `New user ${ROOT_USER_EMAIL} created in user pool ${USER_POOL_NAME}. Check email inbox for temporary password`
      );
    } catch (e) {
      if (e instanceof UsernameExistsException) {
        console.log(`User ${ROOT_USER_EMAIL} already exists in user pool ${USER_POOL_NAME}`);
      } else {
        throw e;
      }
    }
  }

  /**
   * Creates a new Amazon Cognito group in the specified user pool
   * @param groupName - Name of Group to create in Cognito user pool
   * @param userPoolId - ID for Cognito User Pool to add group to
   */
  public async createGroup(groupName: string, userPoolId: string | undefined): Promise<void> {
    if (!userPoolId) {
      userPoolId = await this.getUserPoolId();
    }
    const createGroupInput = {
      GroupName: groupName,
      UserPoolId: userPoolId
    };
    await this._aws.clients.cognito.createGroup(createGroupInput);
  }

  /**
   * Creates a new Amazon Cognito user with the specified username in the specified user pool
   */
  public async adminCreateUser(): Promise<void> {
    const password = this._generatePassword();
    const poolId = await this.getUserPoolId();
    const adminCreateUserInput = {
      ForceAliasCreation: true,
      TemporaryPassword: password,
      UserPoolId: poolId,
      Username: this._constants.ROOT_USER_EMAIL
    };

    await this._aws.clients.cognito.adminCreateUser(adminCreateUserInput);
  }

  /**
   * Add Cognito user to given group
   * @param groupName - Name of Cognito group
   * @param userPoolId - ID of Cognito user pool
   * @param username - Username of user to add to group
   */
  public async adminAddUserToGroup(
    groupName: string,
    userPoolId: string | undefined,
    username: string
  ): Promise<void> {
    if (!userPoolId) {
      userPoolId = await this.getUserPoolId();
    }
    const adminAddUserToGroupInput = {
      GroupName: groupName,
      UserPoolId: userPoolId,
      Username: username
    };
    await this._aws.clients.cognito.adminAddUserToGroup(adminAddUserToGroupInput);
  }

  /**
   * Gets the user pool id of the specified Amazon Cognito user pool
   *
   * @returns user pool id
   */
  public async getUserPoolId(): Promise<string | undefined> {
    const { STACK_NAME } = this._constants;
    const describeStackParam = {
      StackName: STACK_NAME
    };

    const stackDetails = await this._aws.clients.cloudformation.describeStacks(describeStackParam);

    const cognitoUserPoolId = stackDetails.Stacks![0].Outputs!.find((output: Output) => {
      return output.OutputKey && output.OutputKey === 'cognitoUserPoolId';
    })?.OutputValue;

    // Return user pool id of given user pool
    return cognitoUserPoolId;
  }

  /**
   * Creates a password that follows specified paramaters
   *
   * @returns password
   */
  private _generatePassword(): string {
    return passwordGenerator.generate({
      length: 12, // 12 characters in password
      numbers: true, // Include numbers in password
      symbols: true, // Include symbols
      uppercase: true, // Include uppercase
      strict: true // Include at least one character from each pool
    });
  }
}
