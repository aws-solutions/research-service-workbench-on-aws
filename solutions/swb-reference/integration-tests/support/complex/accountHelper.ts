import { AwsService } from '@aws/workbench-core-base';
import ClientSession from '../clientSession';

export class AccountHelper {
  private _awsSdk: AwsService;
  private _adminSession: ClientSession;
  public constructor(awsSdkClient: AwsService, adminSession: ClientSession) {
    this._awsSdk = awsSdkClient;
    this._adminSession = adminSession;
  }

  public async getOnboardedAccount(): Promise<string> {
    const queryParams = {
      index: 'getResourceByCreatedAt',
      key: { name: 'resourceType', value: 'account' }
    };
    const response = await this._awsSdk.helpers.ddb.query(queryParams).execute();
    let accounts: {[id: string]: string}[] = [];
    if (response && response.Items) {
      accounts = response.Items.map((item) => {
        return item as unknown as {[id: string]: string};
      });
    }
    // At least one hosting account is onboarded for integ tests to run, so we get its AWS Account ID
    return accounts[0].awsAccountId;
  }

  public async deleteDdbRecords(accountId: string, awsAccountId: string): Promise<void> {
    await this._awsSdk.helpers.ddb
      .delete({ pk: `ACC#${accountId}`, sk: `ACC#${accountId}` }).execute();
    await this._awsSdk.helpers.ddb
      .delete({ pk: `AWSACC#${awsAccountId}`, sk: `ACC#${accountId}` }).execute();
  }
}
