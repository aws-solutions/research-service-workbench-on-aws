import { CognitoUserManagementPlugin, UserManagementService } from '@aws/workbench-core-authentication';
import { aws } from './awsService';

export const userManagementService: UserManagementService = new UserManagementService(
  new CognitoUserManagementPlugin(process.env.USER_POOL_ID!, aws)
);
