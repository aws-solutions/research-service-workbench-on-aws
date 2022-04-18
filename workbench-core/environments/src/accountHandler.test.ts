import AccountHandler from './accountHandler';
import { AwsService } from '@amzn/workbench-core-base';

describe('AccountHandler', () => {
  test('execute does not return an error', async () => {
    process.env.AWS_REGION = 'us-east-2';
    process.env.LAUNCH_CONSTRAINT_ROLE_NAME = 'LaunchConstraintIamRoleNameOutput';
    process.env.STACK_NAME = 'swb-dev-oh';
    process.env.SSM_DOC_NAME_SUFFIX = 'SSMDocOutput';
    process.env.AMI_IDS_TO_SHARE = JSON.stringify([]);
    const mainAccountAwsService = new AwsService({ region: 'us-east-2' });
    const accountHandler = new AccountHandler(mainAccountAwsService);
    await expect(accountHandler.execute({})).resolves.not.toThrowError();
  });
});
