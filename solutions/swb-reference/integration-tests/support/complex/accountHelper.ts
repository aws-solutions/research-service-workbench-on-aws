import { AwsService } from '@aws/workbench-core-base';
import { IamHelper } from '@aws/workbench-core-datasets';
import { GetBucketPolicyCommandOutput, PutBucketPolicyCommandInput } from '@aws-sdk/client-s3-control';
import { PolicyDocument } from 'aws-cdk-lib/aws-iam';
import _ from 'lodash';
import Setup from '../setup';
import Settings from '../utils/settings';

export class AccountHelper {
  private _awsSdk: AwsService;
  private _settings: Settings;
  public constructor() {
    const setup: Setup = Setup.getSetup();
    this._settings = setup.getSettings();
    this._awsSdk = setup.getMainAwsClient();
  }

  // TODO: Replace with Accounts list API call when it is available
  public async listOnboardedAccounts(): Promise<{ [id: string]: string }[]> {
    const queryParams = {
      index: 'getResourceByCreatedAt',
      key: { name: 'resourceType', value: 'account' }
    };
    const response = await this._awsSdk.helpers.ddb.query(queryParams).execute();
    let accounts: { [id: string]: string }[] = [];
    if (response && response.Items) {
      accounts = response.Items.map((item) => {
        return item as unknown as { [id: string]: string };
      });
    }
    return accounts;
  }

  public async deleteDdbRecords(accountId: string, awsAccountId: string): Promise<void> {
    await this._awsSdk.helpers.ddb.delete({ pk: `ACC#${accountId}`, sk: `ACC#${accountId}` }).execute();
    await this._awsSdk.helpers.ddb.delete({ pk: `AWSACC#${awsAccountId}`, sk: `ACC#${accountId}` }).execute();
  }

  public async verifyBusAllowsAccount(awsAccountId: string): Promise<boolean> {
    const busName = 'default';
    const busRuleName = 'RouteHostEvents';
    const describeRuleParams = { Name: busRuleName, EventBusName: busName };

    // Rule will always exist since other integ tests require an active hosting account onboarded
    const busRule = await this._awsSdk.clients.eventBridge.describeRule(describeRuleParams);

    return _.includes(JSON.parse(busRule.EventPattern!).account, awsAccountId);
  }

  public async removeBusPermissions(awsAccountId: string): Promise<void> {
    const busName = 'default';

    const params = {
      Action: 'events:PutEvents',
      EventBusName: busName,
      Principal: awsAccountId,
      StatementId: `Allow-main-account-to-get-${awsAccountId}-events`
    };

    // Remove permission for main account to receive hosting account events
    await this._awsSdk.clients.eventBridge.removePermission(params);

    const busRuleName = 'RouteHostEvents';
    const describeRuleParams = { Name: busRuleName, EventBusName: busName };

    // Rule will always exist since other integ tests require an active hosting account onboarded
    const busRule = await this._awsSdk.clients.eventBridge.describeRule(describeRuleParams);

    const putRuleParams = {
      Name: busRuleName,
      EventPattern: JSON.stringify({
        account: _.difference(JSON.parse(busRule.EventPattern!).account, [awsAccountId]),
        source: [{ 'anything-but': ['aws.config', 'aws.cloudtrail', 'aws.ssm', 'aws.tag'] }],
        'detail-type': [{ 'anything-but': 'AWS API Call via CloudTrail' }]
      }),
      EventBusName: busName
    };

    // Update rule for main account event bus
    await this._awsSdk.clients.eventBridge.putRule(putRuleParams);
  }

  public async removeAccountFromKeyPolicy(awsAccountId: string): Promise<void> {
    const mainAcctS3ArtifactEncryptionArn = this._settings.get('S3ArtifactEncryptionKeyOutputCC25B0CD');
    const mainAcctS3DatasetsEncryptionArn = this._settings.get('S3DatasetsEncryptionKeyOutput05C7794D');
    const mainAcctEncryptionArnList = [mainAcctS3ArtifactEncryptionArn, mainAcctS3DatasetsEncryptionArn];
    await Promise.all(
      _.map(mainAcctEncryptionArnList, async (mainAcctEncryptionArn) => {
        const keyId = mainAcctEncryptionArn.split('/').pop()!;
        const keyPolicyResponse = await this._awsSdk.clients.kms.getKeyPolicy({
          KeyId: keyId,
          PolicyName: 'default'
        });
        let keyPolicy = PolicyDocument.fromJson(JSON.parse(keyPolicyResponse.Policy!));

        keyPolicy = IamHelper.removePrincipalFromStatement(
          keyPolicy,
          'main-key-share-statement',
          `arn:aws:iam::${awsAccountId}:root`
        );

        const putPolicyParams = {
          KeyId: keyId,
          PolicyName: 'default',
          Policy: JSON.stringify(keyPolicy.toJSON())
        };

        // Update key policy
        await this._awsSdk.clients.kms.putKeyPolicy(putPolicyParams);
      })
    );
  }

  public async removeAccountFromBucketPolicy(awsAccountId: string): Promise<void> {
    const bucketName = this._settings.get('S3BucketArtifactsArnOutput').split(':').pop();
    const bucketPolicyResponse: GetBucketPolicyCommandOutput = await this._awsSdk.clients.s3.getBucketPolicy({
      Bucket: bucketName,
      ExpectedBucketOwner: process.env.MAIN_ACCT_ID
    });
    let bucketPolicy;
    bucketPolicy = PolicyDocument.fromJson(JSON.parse(bucketPolicyResponse.Policy!));

    bucketPolicy = IamHelper.removePrincipalFromStatement(
      bucketPolicy,
      'List:environment-files',
      `arn:aws:iam::${awsAccountId}:root`
    );

    bucketPolicy = IamHelper.removePrincipalFromStatement(
      bucketPolicy,
      'Get:environment-files',
      `arn:aws:iam::${awsAccountId}:root`
    );

    const putPolicyParams: PutBucketPolicyCommandInput = {
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy.toJSON()),
      AccountId: process.env.MAIN_ACCT_ID
    };

    // Update bucket policy
    await this._awsSdk.clients.s3.putBucketPolicy(putPolicyParams);
  }

  public async deOnboardAccount(awsAccountId: string): Promise<void> {
    // Undo all operations that happen in: hostingAccountLifecycleService.createAccount()

    // Update main account default event bus to remove hosting account state change events
    await this.removeBusPermissions(awsAccountId);

    // Remove account to artifactBucket's bucket policy
    await this.removeAccountFromBucketPolicy(awsAccountId);

    // Update main account encryption key policy
    await this.removeAccountFromKeyPolicy(awsAccountId);
  }
}
