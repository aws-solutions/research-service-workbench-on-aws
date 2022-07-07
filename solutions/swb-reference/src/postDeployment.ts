/* eslint-disable security/detect-non-literal-fs-filename */
import fs from 'fs';
import { join } from 'path';
import { CognitoSetup, ServiceCatalogSetup } from '@amzn/environments';
import { AwsService } from '@amzn/workbench-core-base';
import { getConstants } from './constants';

async function run(): Promise<void> {
  const {
    AWS_REGION,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    SC_PORTFOLIO_NAME,
    S3_ARTIFACT_BUCKET_ARN_NAME,
    LAUNCH_CONSTRAINT_ROLE_NAME,
    STACK_NAME,
    ROOT_USER_EMAIL,
    USER_POOL_NAME
  } = getConstants();
  const scSetup = new ServiceCatalogSetup({
    AWS_REGION,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    SC_PORTFOLIO_NAME,
    S3_ARTIFACT_BUCKET_ARN_NAME,
    LAUNCH_CONSTRAINT_ROLE_NAME,
    STACK_NAME
  });
  const cognitoSetup = new CognitoSetup({
    AWS_REGION,
    ROOT_USER_EMAIL,
    USER_POOL_NAME
  });

  const cfnFilePaths: string[] = scSetup.getCfnTemplate(join(__dirname, '../../src/environment'));
  await scSetup.run(cfnFilePaths);
  await cognitoSetup.run();
  await uploadOnboardAccountCfnToS3();
  await uploadBootstrapScriptsToS3();
}

async function uploadOnboardAccountCfnToS3(): Promise<void> {
  console.log('Uploading onboard-account.cfn.yaml to S3');
  const { AWS_REGION } = getConstants();
  const awsService = new AwsService({ region: AWS_REGION });
  const onboardAccountFilePath = join(__dirname, '../../src/templates/onboard-account.cfn.yaml');
  const onboardAccountFile = fs.readFileSync(onboardAccountFilePath);
  const s3Service = awsService.helpers.s3;
  const s3ArtifactBucketArn = await getS3BucketArn(awsService);
  await s3Service.uploadFiles(s3ArtifactBucketArn, [
    { fileContent: onboardAccountFile, fileName: 'onboard-account.cfn.yaml', s3Prefix: '' }
  ]);
}

async function uploadBootstrapScriptsToS3(): Promise<void> {
  console.log('Uploading environment bootstrap scripts to S3');
  const { AWS_REGION, S3_ARTIFACT_BUCKET_BOOTSTRAP_PREFIX } = getConstants();
  const awsService = new AwsService({ region: AWS_REGION });
  const s3ArtifactBucketArn = await getS3BucketArn(awsService);
  const s3BucketName = s3ArtifactBucketArn.split(':').pop() as string;

  // resolve full folder path
  const scriptsPath = join(__dirname, '../../src/environment-files');

  const recursiveUpload = async (path: string, dirName: string): Promise<void> => {
    const fileAndDirInCurrFolder = fs.readdirSync(path);
    for (const name of fileAndDirInCurrFolder) {
      // nosemgrep
      const isDirectory = fs.lstatSync(join(path, name)).isDirectory();
      if (isDirectory) {
        await recursiveUpload(join(path, name), `${dirName}${name}/`);
      } else {
        // nosemgrep
        const fileContent = fs.readFileSync(`${path}/${name}`);
        const putObjectParam = {
          Bucket: s3BucketName,
          Key: `${S3_ARTIFACT_BUCKET_BOOTSTRAP_PREFIX}${dirName}${name}`,
          Body: fileContent
        };

        await awsService.clients.s3.putObject(putObjectParam);
      }
    }
  };

  await recursiveUpload(scriptsPath, '');
  console.log('Done uploading environment bootstrap scripts to S3');
}

async function getS3BucketArn(awsService: AwsService): Promise<string> {
  const { S3_ARTIFACT_BUCKET_ARN_NAME, STACK_NAME } = getConstants();
  const cfService = awsService.helpers.cloudformation;
  const { [S3_ARTIFACT_BUCKET_ARN_NAME]: s3ArtifactBucketArn } = await cfService.getCfnOutput(STACK_NAME, [
    S3_ARTIFACT_BUCKET_ARN_NAME
  ]);
  return s3ArtifactBucketArn;
}

/* eslint-disable-next-line @typescript-eslint/no-floating-promises*/
(async (): Promise<void> => {
  await run();
})();
