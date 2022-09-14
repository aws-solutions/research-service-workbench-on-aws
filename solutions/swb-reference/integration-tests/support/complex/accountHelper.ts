// import { GetBucketPolicyCommandOutput, PutBucketPolicyCommandInput } from '@aws-sdk/client-s3-control';
import { AwsService } from '@aws/workbench-core-base';
// import { IamHelper } from '@aws/workbench-core-datasets';
import _ from 'lodash';

export class AccountHelper {
  private _awsSdk: AwsService;
  public constructor(awsSdkClient: AwsService) {
    this._awsSdk = awsSdkClient;
  }

  public async listOnboardedAccounts(): Promise<{[id: string]: string}[]> {
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
    return accounts;
  }

  public async deleteDdbRecords(accountId: string, awsAccountId: string): Promise<void> {
    await this._awsSdk.helpers.ddb
      .delete({ pk: `ACC#${accountId}`, sk: `ACC#${accountId}` }).execute();
    await this._awsSdk.helpers.ddb
      .delete({ pk: `AWSACC#${awsAccountId}`, sk: `ACC#${accountId}` }).execute();
  }

  public async verifyBusPermitsAccount(awsAccountId: string): Promise<boolean> {
    const busName = 'default';
    const busRuleName = 'RouteHostEvents';
    const describeRuleParams = { Name: busRuleName, EventBusName: busName };

    // Rule will always exist since other integ tests require an active hosting account onboarded
    const busRule = await this._awsSdk.clients.eventBridge.describeRule(describeRuleParams);

    return _.includes(JSON.parse(busRule.EventPattern!).account, awsAccountId);
  }

  public async updateBusPermissions(awsAccountId: string): Promise<void> {
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

  // public async updateArtifactsBucketPolicy(artifactBucketArn: string, awsAccountId: string): Promise<void> {
  //   const bucketName = artifactBucketArn.split(':').pop() as string;

  //   let bucketPolicy: PolicyDocument = new PolicyDocument();
  //   try {
  //     const bucketPolicyResponse: GetBucketPolicyCommandOutput = await this._aws.clients.s3.getBucketPolicy({
  //       Bucket: bucketName
  //     });
  //     bucketPolicy = PolicyDocument.fromJson(JSON.parse(bucketPolicyResponse.Policy!));
  //   } catch (e) {
  //     // All errors should be thrown except "NoSuchBucketPolicy" error. For "NoSuchBucketPolicy" error we assign new bucket policy for bucket
  //     if (e.Code !== 'NoSuchBucketPolicy') {
  //       throw e;
  //     }
  //   }

  //   // If List statement doesn't exist, create one
  //   if (!IamHelper.containsStatementId(bucketPolicy, 'List:environment-files')) {
  //     const listStatement = PolicyStatement.fromJson(
  //       JSON.parse(`
  //      {
  //       "Sid": "List:environment-files",
  //       "Effect": "Allow",
  //       "Principal": {
  //         "AWS":"arn:aws:iam::${awsAccountId}:root"
  //       },
  //       "Action": "s3:ListBucket",
  //       "Resource": ["${artifactBucketArn}"],
  //       "Condition": {
  //         "StringLike": {
  //           "s3:prefix": "environment-files*"
  //           }
  //         }
  //       }`)
  //     );
  //     bucketPolicy.addStatements(listStatement);
  //   } else {
  //     // If List statement doesn't contain this accountId, add it
  //     bucketPolicy = IamHelper.addPrincipalToStatement(
  //       bucketPolicy,
  //       'List:environment-files',
  //       `arn:aws:iam::${awsAccountId}:root`
  //     );
  //   }

  //   // If Get statement doesn't exist, create one
  //   if (!IamHelper.containsStatementId(bucketPolicy, 'Get:environment-files')) {
  //     const getStatement = PolicyStatement.fromJson(
  //       JSON.parse(`
  //      {
  //       "Sid": "Get:environment-files",
  //       "Effect": "Allow",
  //       "Principal": {
  //         "AWS":"arn:aws:iam::${awsAccountId}:root"
  //       },
  //       "Action": "s3:GetObject",
  //       "Resource": ["${artifactBucketArn}/environment-files*"]
  //       }`)
  //     );
  //     bucketPolicy.addStatements(getStatement);
  //   } else {
  //     // If Get statement doesn't contain this accountId, add it
  //     bucketPolicy = IamHelper.addPrincipalToStatement(
  //       bucketPolicy,
  //       'Get:environment-files',
  //       `arn:aws:iam::${awsAccountId}:root`
  //     );
  //   }

  //   const putPolicyParams: PutBucketPolicyCommandInput = {
  //     Bucket: bucketName,
  //     Policy: JSON.stringify(bucketPolicy.toJSON())
  //   };

  //   // Update bucket policy
  //   await this._aws.clients.s3.putBucketPolicy(putPolicyParams);
  // }

  public async deOnboardAccount(awsAccountId: string): Promise<void> {
  // TODO: Undo all operations that happen in: hostingAccountLifecycleService.initializeAccount() and hostingAccountLifecycleService.updateAccount()

  // Update main account default event bus to remove hosting account state change events
  await this.updateBusPermissions(awsAccountId);

  // Remove account to artifactBucket's bucket policy
  // await this.updateArtifactsBucketPolicy(artifactBucketArn, accountMetadata.awsAccountId);

  // Update main account encryption key policy
  // await this.updateMainAccountEncryptionKeyPolicy(mainAcctEncryptionArn, accountMetadata.awsAccountId);

  }

  
}
