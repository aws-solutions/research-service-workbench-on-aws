/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable */
import { CognitoSetup, ServiceCatalogSetup } from '@amzn/environments';
import { getConstants } from './constants';
import { join } from 'path';
import fs from 'fs';
import { AwsService, CloudformationService } from '@amzn/workbench-core-base';
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
  // const scSetup = new ServiceCatalogSetup({
  //   AWS_REGION,
  //   S3_ARTIFACT_BUCKET_SC_PREFIX,
  //   PORTFOLIO_NAME,
  //   S3_ARTIFACT_BUCKET_ARN_NAME,
  //   LAUNCH_CONSTRAINT_ROLE_NAME,
  //   STACK_NAME
  // });
  // const cognitoSetup = new CognitoSetup({
  //   AWS_REGION,
  //   ROOT_USER_EMAIL,
  //   USER_POOL_NAME
  // });

  // const cfnFilePaths: string[] = scSetup.getCfnTemplate(join(__dirname, '../src/environment'));
  // await scSetup.run(cfnFilePaths);
  // await cognitoSetup.run();

  const onboardAccountFilePath = join(__dirname, '../src/templates/onboard-account.cfn.yaml');
  const awsService = new AwsService({ region: AWS_REGION });
  const cfService = new CloudformationService(awsService.cloudformation);
  const { [S3_ARTIFACT_BUCKET_ARN_NAME]: s3ArtifactBucketArn } = await cfService.getCfnOutput(STACK_NAME, [
    S3_ARTIFACT_BUCKET_ARN_NAME
  ]);

  const s3BucketName = s3ArtifactBucketArn.split(':').pop() || '';
  await uploadFileToS3(
    s3BucketName,
    '',
    onboardAccountFilePath,
    onboardAccountFilePath.split('/').pop() as string
  );
}

async function uploadFileToS3(s3BucketName: string, prefix: string, filePath: string, fileName: string) {
  const fileContent = fs.readFileSync(filePath);
  const awsService = new AwsService({ region: 'us-east-2' });
  console.log('fileContent', fileContent);
  console.log('s3BucketName', s3BucketName);
  console.log('filePath', filePath);
  const putObjectParam = {
    Bucket: s3BucketName,
    Key: `${prefix}${fileName}`,
    Body: fileContent
  };
  const response = await awsService.s3.putObject(putObjectParam);
  console.log('response', response);
}

/* eslint-disable-next-line @typescript-eslint/no-floating-promises*/
(async (): Promise<void> => {
  await run();
})();
