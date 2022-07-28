/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable security/detect-non-literal-fs-filename */
import fs, { createWriteStream } from 'fs';
import { join } from 'path';
import * as stream from 'stream';
import { promisify } from 'util';
import { AwsService } from '@amzn/workbench-core-base';
import { CognitoSetup, ServiceCatalogSetup } from '@amzn/workbench-core-environments';
import Axios from 'axios';
import { getConstants } from './constants';

async function run(): Promise<void> {
  const {
    AWS_REGION,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    SC_PORTFOLIO_NAME,
    S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY,
    LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY,
    STACK_NAME,
    ROOT_USER_EMAIL,
    USER_POOL_NAME
  } = getConstants();
  const scSetup = new ServiceCatalogSetup({
    AWS_REGION,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    SC_PORTFOLIO_NAME,
    S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY,
    LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY,
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
  console.log('Finished uploading onboard-account.cfn.yaml to S3');
}

async function downloadFile(fileUrl: string, outputLocationPath: string): Promise<void> {
  const finished = promisify(stream.finished);
  const writer = createWriteStream(outputLocationPath);
  return Axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream'
  }).then((response) => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  });
}

async function uploadBootstrapScriptsToS3(): Promise<void> {
  const { AWS_REGION, S3_ARTIFACT_BUCKET_BOOTSTRAP_PREFIX } = getConstants();
  const awsService = new AwsService({ region: AWS_REGION });
  const s3ArtifactBucketArn = await getS3BucketArn(awsService);
  const s3BucketName = s3ArtifactBucketArn.split(':').pop() as string;

  // resolve full folder path
  const scriptsPath = join(__dirname, '../../src/environment-files');
  const binaryPath = join(__dirname, '../../src/environment-files/offline-packages');
  const sagemakerPath = join(__dirname, '../../src/environment-files/offline-packages/sagemaker');
  const fusePath = join(__dirname, '../../src/environment-files/offline-packages/sagemaker/fuse-2.9.4');

  if (!fs.existsSync(binaryPath)) fs.mkdirSync(binaryPath);
  if (!fs.existsSync(sagemakerPath)) fs.mkdirSync(sagemakerPath);
  if (!fs.existsSync(fusePath)) fs.mkdirSync(fusePath);

  console.log('Downloading offline file-system binary packages');

  await Promise.all([
    downloadFile(
      'https://raw.githubusercontent.com/aws-samples/amazon-sagemaker-notebook-instance-lifecycle-config-samples/master/scripts/auto-stop-idle/autostop.py',
      `${sagemakerPath}/autostop.py`
    ),

    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/main/c31535f74c6e/x86_64/Packages/basesystem-10.0-4.9.amzn1.noarch.rpm',
      `${fusePath}/basesystem-10.0-4.9.amzn1.noarch.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/updates/adeeb554baf5/x86_64/Packages/bash-4.2.46-34.43.amzn1.x86_64.rpm',
      `${fusePath}/bash-4.2.46-34.43.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/main/c31535f74c6e/x86_64/Packages/filesystem-2.4.30-3.8.amzn1.x86_64.rpm',
      `${fusePath}/filesystem-2.4.30-3.8.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/updates/adeeb554baf5/x86_64/Packages/fuse-2.9.4-1.18.amzn1.x86_64.rpm',
      `${fusePath}/fuse-2.9.4-1.18.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/updates/adeeb554baf5/x86_64/Packages/glibc-2.17-292.180.amzn1.x86_64.rpm',
      `${fusePath}/glibc-2.17-292.180.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/updates/adeeb554baf5/x86_64/Packages/glibc-common-2.17-292.180.amzn1.x86_64.rpm',
      `${fusePath}/glibc-common-2.17-292.180.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/main/c31535f74c6e/x86_64/Packages/info-5.1-4.10.amzn1.x86_64.rpm',
      `${fusePath}/info-5.1-4.10.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/main/c31535f74c6e/x86_64/Packages/libgcc72-7.2.1-2.59.amzn1.x86_64.rpm',
      `${fusePath}/libgcc72-7.2.1-2.59.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/main/c31535f74c6e/x86_64/Packages/libselinux-2.1.10-3.22.amzn1.x86_64.rpm',
      `${fusePath}/libselinux-2.1.10-3.22.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/main/c31535f74c6e/x86_64/Packages/libsepol-2.1.7-3.12.amzn1.x86_64.rpm',
      `${fusePath}/libsepol-2.1.7-3.12.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/main/c31535f74c6e/x86_64/Packages/ncurses-base-5.7-4.20090207.14.amzn1.x86_64.rpm',
      `${fusePath}/ncurses-base-5.7-4.20090207.14.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/main/c31535f74c6e/x86_64/Packages/ncurses-libs-5.7-4.20090207.14.amzn1.x86_64.rpm',
      `${fusePath}/ncurses-libs-5.7-4.20090207.14.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/updates/adeeb554baf5/x86_64/Packages/nspr-4.21.0-1.43.amzn1.x86_64.rpm',
      `${fusePath}/nspr-4.21.0-1.43.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/updates/adeeb554baf5/x86_64/Packages/nss-softokn-freebl-3.44.0-8.44.amzn1.x86_64.rpm',
      `${fusePath}/nss-softokn-freebl-3.44.0-8.44.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/updates/adeeb554baf5/x86_64/Packages/nss-util-3.44.0-4.56.amzn1.x86_64.rpm',
      `${fusePath}/nss-util-3.44.0-4.56.amzn1.x86_64.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/main/c31535f74c6e/x86_64/Packages/setup-2.8.14-20.12.amzn1.noarch.rpm',
      `${fusePath}/setup-2.8.14-20.12.amzn1.noarch.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/updates/adeeb554baf5/x86_64/Packages/tzdata-2020d-2.76.amzn1.noarch.rpm',
      `${fusePath}/tzdata-2020d-2.76.amzn1.noarch.rpm`
    ),
    downloadFile(
      'http://packages.eu-central-1.amazonaws.com/2018.03/main/c31535f74c6e/x86_64/Packages/which-2.19-6.10.amzn1.x86_64.rpm',
      `${fusePath}/which-2.19-6.10.amzn1.x86_64.rpm`
    ),

    downloadFile(
      'https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64',
      `${binaryPath}/jq-1.5-linux64`
    ),
    downloadFile(
      'https://github.com/kahing/goofys/releases/download/v0.24.0/goofys',
      `${binaryPath}/goofys-0.24.0`
    )
  ]);

  const s3Service = awsService.helpers.s3;
  console.log(
    `Uploading offline environment bootstrap scripts to S3 bucket ${s3BucketName}, path: ${S3_ARTIFACT_BUCKET_BOOTSTRAP_PREFIX}`
  );
  await s3Service.uploadFolder(s3BucketName, S3_ARTIFACT_BUCKET_BOOTSTRAP_PREFIX, scriptsPath);
  console.log('Finished uploading offline environment bootstrap scripts to S3');
}

async function getS3BucketArn(awsService: AwsService): Promise<string> {
  const { S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY, STACK_NAME } = getConstants();
  const cfService = awsService.helpers.cloudformation;
  const { [S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY]: s3ArtifactBucketArn } = await cfService.getCfnOutput(
    STACK_NAME,
    [S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY]
  );
  return s3ArtifactBucketArn;
}

/* eslint-disable-next-line @typescript-eslint/no-floating-promises*/
(async (): Promise<void> => {
  await run();
})();
