/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@amzn/workbench-core-base';
import {
  GroupExistsException,
  ListUserPoolsCommandInput,
  UserPoolDescriptionType,
  UsernameExistsException
} from '@aws-sdk/client-cognito-identity-provider';
import passwordGenerator from 'generate-password';

export default class CognitoSetup {
  private _aws: AwsService;
  private _constants: {
    AWS_REGION: string;
    ROOT_USER_EMAIL: string;
    USER_POOL_NAME: string;
  };

  public constructor(constants: { AWS_REGION: string; ROOT_USER_EMAIL: string; USER_POOL_NAME: string }) {
    this._constants = constants;

    const { AWS_REGION } = constants;
    this._aws = new AwsService({ region: AWS_REGION });
  }

  public async run(): Promise<void> {
    const { USER_POOL_NAME, ROOT_USER_EMAIL } = this._constants;

    const userPoolId = await this._getUserPoolId();
    console.log(`User pool id: ${userPoolId}`);

    // Create Admin and Researcher groups in user pool if they do not exist
    try {
      await this.createGroup('Admin', userPoolId);
      console.log('Creating Admin group because group does not exist');
    } catch (e) {
      if (e instanceof GroupExistsException) {
        console.log(`Admin group already exists in user pool ${USER_POOL_NAME}`);
      } else {
        throw e;
      }
    }

    try {
      await this.createGroup('Researcher', userPoolId);
      console.log('Creating Researcher group because group does not exist');
    } catch (e) {
      if (e instanceof GroupExistsException) {
        console.log(`Researcher group already exists in user pool ${USER_POOL_NAME}`);
      } else {
        throw e;
      }
    }

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

    // Add user to Admin user group if it has not already been added
    await this.adminAddUserToGroup('Admin', userPoolId, ROOT_USER_EMAIL);
    console.log(`User ${ROOT_USER_EMAIL} added to Admin group`);
  }

  /**
   * Creates a new Amazon Cognito group in the specified user pool
   * @param groupName - Name of Group to create in Cognito user pool
   * @param userPoolId - ID for Cognito User Pool to add group to
   */
  public async createGroup(groupName: string, userPoolId: string | undefined): Promise<void> {
    if (!userPoolId) {
      userPoolId = await this._getUserPoolId();
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
    const poolId = await this._getUserPoolId();
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
      userPoolId = await this._getUserPoolId();
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
  private async _getUserPoolId(): Promise<string | undefined> {
    // Get list of user pools
    let userPools: UserPoolDescriptionType[] = [];
    let nextToken: string | undefined = undefined;

    do {
      // Add all pages of ListUserPoolsOutput to the userPools array until there are no more pages
      const listUserPoolsInput: ListUserPoolsCommandInput = {
        MaxResults: 20,
        NextToken: nextToken
      };

      const listUserPoolsOutput = await this._aws.clients.cognito.listUserPools(listUserPoolsInput);
      nextToken = listUserPoolsOutput.NextToken;
      if (listUserPoolsOutput.UserPools) {
        userPools = userPools.concat(listUserPoolsOutput.UserPools);
      }
    } while (nextToken);

    // Find user pool in output with given user pool name
    const userPool = userPools.find(
      (userPool: UserPoolDescriptionType) => userPool.Name === this._constants.USER_POOL_NAME
    );

    // Return user pool id of given user pool
    return userPool?.Id;
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
