import { S3Client } from '@aws-sdk/client-s3';
import { AwsService } from '@aws/workbench-core-base';
import { AccountCfnTemplateParameters } from '../models/accountCfnTemplate';
import AccountService from './accountService';

describe('foo', () => {
  test('get presigned url', async () => {
    const region = 'eu-north-1';
    const aws: AwsService = new AwsService({
      region,
      ddbTableName: 'swb-dev1-sto'
    });

    const credentials = await aws.clients.s3.config.credentials();

    const s3Client = new S3Client({
      credentials,
      region
    });

    const templateParameters: AccountCfnTemplateParameters = {
      accountHandlerRole: `123`,
      apiHandlerRole: `123`,
      enableFlowLogs: 'true',
      externalId: '123',
      launchConstraintPolicyPrefix: '*', // We can do better, get from stack outputs?
      launchConstraintRolePrefix: '*', // We can do better, get from stack outputs?
      mainAccountId: '123',
      namespace: '123',
      stackName: '-hosting-account',
      statusHandlerRole: 'arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va'
    };
    const accountService = new AccountService(aws.helpers.ddb);
    const url = await accountService.getTemplateURLForAccount(
      'arn:aws:s3:::swb-dev1-sto-s3artifacts6892ee6a-j8ictcubve6h',
      templateParameters,
      s3Client
    );

    console.log('url', url);
  });
});
