import HostingAccountLifecycleService from './hostingAccountLifecycleService';

export default class HostingAccountService {
  public constants: {
    AWS_REGION: string;
    STACK_NAME: string;
    SSM_DOC_NAME_SUFFIX: string;
    MAIN_ACCOUNT_BUS_ARN_NAME: string;
    AMI_IDS_TO_SHARE: string;
  };
  public constructor(constants: {
    AWS_REGION: string;
    STACK_NAME: string;
    SSM_DOC_NAME_SUFFIX: string;
    MAIN_ACCOUNT_BUS_ARN_NAME: string;
    AMI_IDS_TO_SHARE: string;
  }) {
    this.constants = constants;
  }

  public async create(accountMetadata: {
    accountId: string;
    envManagementRoleArn: string;
    accountHandlerRoleArn: string;
  }): Promise<string> {
    const lifecycleService = new HostingAccountLifecycleService(this.constants);
    await lifecycleService.initializeAccount(accountMetadata);

    return Promise.resolve(`Hosting account ${accountMetadata.accountId} has been successfully provisioned`);
  }
}
