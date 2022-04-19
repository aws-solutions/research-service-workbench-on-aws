import { AwsService } from '@amzn/workbench-core-base';
import {
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

    // Create Cognito user pool if pool does not exist
    let userPoolId = await this._getUserPoolId();
    if (userPoolId === undefined) {
      console.log('Creating new user pool because user pool does not exist');
      userPoolId = await this.createUserPool();
      console.log('New user pool created');
    } else {
      console.log('User pool previously created');
    }
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
   * Creates a new Amazon Cognito user pool with the specified user pool name
   *
   * @returns the id of the newly created user pool
   */
  public async createUserPool(): Promise<string | undefined> {
    const createUserPoolInput = {
      AutoVerifiedAttributes: ['email'],
      PoolName: this._constants.USER_POOL_NAME,
      UsernameAttributes: ['email']
    };

    const response = await this._aws.cognito.createUserPool(createUserPoolInput);
    return response?.UserPool?.Id;
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

    await this._aws.cognito.adminCreateUser(adminCreateUserInput);
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

      const listUserPoolsOutput = await this._aws.cognito.listUserPools(listUserPoolsInput);
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
