import HostingAccountLifecycleService from './hostingAccountLifecycleService';

export default class HostingAccountService {
  public async create(accountMetadata: { [key: string]: string }): Promise<{ [key: string]: string }> {
    const lifecycleService = new HostingAccountLifecycleService();

    return lifecycleService.initializeAccount(accountMetadata);
  }
}
