/* eslint-disable security/detect-non-literal-fs-filename */
import { CognitoSetup, ServiceCatalogSetup } from '@amzn/environments';
import { getConstants } from './constants';
import { join } from 'path';
import fs from 'fs';
import { AwsService, CloudformationService, S3Service } from '@amzn/workbench-core-base';
async function run(): Promise<void> {
  const {
    AWS_REGION,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    PORTFOLIO_NAME,
    S3_ARTIFACT_BUCKET_ARN_NAME,
    LAUNCH_CONSTRAINT_ROLE_NAME,
    STACK_NAME,
    ROOT_USER_EMAIL,
    USER_POOL_NAME
  } = getConstants();
  const scSetup = new ServiceCatalogSetup({
    AWS_REGION,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    PORTFOLIO_NAME,
    S3_ARTIFACT_BUCKET_ARN_NAME,
    LAUNCH_CONSTRAINT_ROLE_NAME,
    STACK_NAME
  });
  const cognitoSetup = new CognitoSetup({
    AWS_REGION,
    ROOT_USER_EMAIL,
    USER_POOL_NAME
  });

  const cfnFilePaths: string[] = scSetup.getCfnTemplate(join(__dirname, '../src/environment'));
  await scSetup.run(cfnFilePaths);
  await cognitoSetup.run();
  await uploadOnboardAccountCfnToS3();
}

async function uploadOnboardAccountCfnToS3(): Promise<void> {
  console.log('Uploading onboard-account.cfn.yaml to S3');
  const { AWS_REGION, S3_ARTIFACT_BUCKET_ARN_NAME, STACK_NAME } = getConstants();
  const awsService = new AwsService({ region: AWS_REGION });
  const cfService = new CloudformationService(awsService.cloudformation);
  const { [S3_ARTIFACT_BUCKET_ARN_NAME]: s3ArtifactBucketArn } = await cfService.getCfnOutput(STACK_NAME, [
    S3_ARTIFACT_BUCKET_ARN_NAME
  ]);
  const onboardAccountFilePath = join(__dirname, '../src/templates/onboard-account.cfn.yaml');
  const onboardAccountFile = fs.readFileSync(onboardAccountFilePath);
  const s3Service = new S3Service(awsService.s3);
  await s3Service.uploadFiles(s3ArtifactBucketArn, [
    { fileContent: onboardAccountFile, fileName: 'onboard-account.cfn.yaml', s3Prefix: '' }
  ]);
}

/* eslint-disable-next-line @typescript-eslint/no-floating-promises*/
(async (): Promise<void> => {
  await run();
})();
