/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

function getConstants(): {
  STAGE: string;
  STACK_NAME: string;
  SC_PORTFOLIO_NAME: string;
  AWS_REGION: string;
  SSM_DOC_OUTPUT_KEY_SUFFIX: string;
  S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY: string;
  S3_ACCESS_BUCKET_PREFIX: string;
  S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY: string;
  S3_DATASETS_BUCKET_ARN_OUTPUT_KEY: string;
  S3_ARTIFACT_BUCKET_SC_PREFIX: string;
  S3_ARTIFACT_BUCKET_BOOTSTRAP_PREFIX: string;
  LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY: string;
  AMI_IDS_TO_SHARE: string;
  ROOT_USER_EMAIL: string;
  USER_POOL_CLIENT_NAME: string;
  USER_POOL_NAME: string;
  STATUS_HANDLER_ARN_OUTPUT_KEY: string;
  ALLOWED_ORIGINS: string;
  AWS_REGION_SHORT_NAME: string;
  UI_CLIENT_URL: string;
  COGNITO_DOMAIN: string;
  WEBSITE_URL: string;
  USER_POOL_ID: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY: string;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const config: any = yaml.load(
    // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
    // correct file
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(join(__dirname, `../../src/config/${process.env.STAGE}.yaml`), 'utf8') // nosemgrep
  );

  const STACK_NAME = `swb-${config.stage}-${config.awsRegionShortName}`;
  const SC_PORTFOLIO_NAME = `swb-${config.stage}-${config.awsRegionShortName}`; // Service Catalog Portfolio Name
  const AWS_REGION = config.awsRegion;
  const AWS_REGION_SHORT_NAME = config.awsRegionShortName;
  const S3_ACCESS_BUCKET_PREFIX = 'service-workbench-access-log';
  const S3_ARTIFACT_BUCKET_SC_PREFIX = 'service-catalog-cfn-templates/';
  const S3_ARTIFACT_BUCKET_BOOTSTRAP_PREFIX = 'environment-files/'; // Location of env bootstrap scripts in the artifacts bucket
  const ROOT_USER_EMAIL = config.rootUserEmail;
  const allowedOrigins: string[] = config.allowedOrigins || [];
  const uiClientURL = getUiClientUrl();
  if (uiClientURL) allowedOrigins.push(uiClientURL);
  const USER_POOL_CLIENT_NAME = `swb-client-${config.stage}-${config.awsRegionShortName}`;
  const USER_POOL_NAME = `swb-userpool-${config.stage}-${config.awsRegionShortName}`;
  const COGNITO_DOMAIN = config.cognitoDomain;
  const WEBSITE_URL = uiClientURL || config.websiteUrl;
  const USER_POOL_ID = config.userPoolId;
  const CLIENT_ID = config.clientId;
  const CLIENT_SECRET = config.clientSecret;

  const AMI_IDS: string[] = [];

  // These are the OutputKey for the SWB Main Account CFN stack
  const SSM_DOC_OUTPUT_KEY_SUFFIX = 'SSMDocOutput';
  const S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY = 'S3BucketAccessLogsNameOutput';
  const S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY = 'S3BucketArtifactsArnOutput';
  const S3_DATASETS_BUCKET_ARN_OUTPUT_KEY = 'S3BucketDatasetsArnOutput';
  const LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY = 'LaunchConstraintIamRoleNameOutput';
  const STATUS_HANDLER_ARN_OUTPUT_KEY = 'StatusHandlerLambdaArnOutput';
  const MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY = 'MainAccountEncryptionKeyOutput';

  return {
    STAGE: config.stage,
    STACK_NAME,
    SC_PORTFOLIO_NAME,
    AWS_REGION,
    SSM_DOC_OUTPUT_KEY_SUFFIX,
    S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY,
    S3_ACCESS_BUCKET_PREFIX,
    S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY,
    S3_DATASETS_BUCKET_ARN_OUTPUT_KEY,
    S3_ARTIFACT_BUCKET_SC_PREFIX,
    S3_ARTIFACT_BUCKET_BOOTSTRAP_PREFIX,
    LAUNCH_CONSTRAINT_ROLE_OUTPUT_KEY,
    AMI_IDS_TO_SHARE: JSON.stringify(AMI_IDS),
    ROOT_USER_EMAIL,
    USER_POOL_CLIENT_NAME,
    USER_POOL_NAME,
    ALLOWED_ORIGINS: JSON.stringify(allowedOrigins),
    AWS_REGION_SHORT_NAME: AWS_REGION_SHORT_NAME,
    UI_CLIENT_URL: uiClientURL,
    STATUS_HANDLER_ARN_OUTPUT_KEY,
    COGNITO_DOMAIN,
    WEBSITE_URL,
    USER_POOL_ID,
    CLIENT_ID,
    CLIENT_SECRET,
    MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY
  };
}

function getUiClientUrl(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uiClientOutput: any = JSON.parse(
      // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
      // correct file
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFileSync(
        join(__dirname, `../../../swb-ui/infrastructure/src/config/${process.env.STAGE}.js`),
        'utf8'
      ) // nosemgrep
    );
    const uiClientStackName = Object.entries(uiClientOutput).map(([key, value]) => key)[0]; //output has a format { stackname: {...props} }
    // eslint-disable-next-line security/detect-object-injection
    return uiClientOutput[uiClientStackName].WebsiteURL;
  } catch {
    console.log(`No UI Client deployed found for ${process.env.STAGE}.`);
    return '';
  }
}

export { getConstants };
