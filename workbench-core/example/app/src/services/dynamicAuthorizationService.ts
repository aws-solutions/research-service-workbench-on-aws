import { DynamicAuthorizationService, WBCGroupManagementPlugin } from '@aws/workbench-core-authorization';
import { authorizationGroupPrefix } from '../configs/constants';
import { dynamicAuthAws } from './awsService';
import { userManagementService } from './userManagementService';

const wbcGroupManagementPlugin: WBCGroupManagementPlugin = new WBCGroupManagementPlugin({
  userManagementService,
  ddbService: dynamicAuthAws.helpers.ddb,
  userGroupKeyType: authorizationGroupPrefix
});

export const dynamicAuthorizationService: DynamicAuthorizationService = new DynamicAuthorizationService({
  groupManagementPlugin: wbcGroupManagementPlugin
});
