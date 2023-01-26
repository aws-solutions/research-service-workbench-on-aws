/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import { join } from 'path';

function getConstants(): {
  STAGE: string;
  ACCOUNT_ID: string;
  API_BASE_URL: string;
  AWS_REGION: string;
  STACK_NAME: string;
  S3_ACCESS_LOGS_BUCKET_PREFIX: string;
  S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY: string;
  SWB_DOMAIN_NAME: string;
  MAIN_ACCT_ALB_LISTENER_ARN: string;
  S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY: string;
  S3_ARTIFACT_BUCKET_NAME: string;
  S3_ARTIFACT_BUCKET_DEPLOYMENT_NAME: string;
  ACCESS_IDENTITY_ARTIFACT_NAME: string;
  DISTRIBUTION_ARTIFACT_NAME: string;
  DISTRIBUTION_ARTIFACT_DOMAIN: string;
  DISTRIBUTION_FUNCTION_ARTIFACT_NAME: string;
  DISTRIBUTION_FUNCTION_NAME: string;
  RESPONSE_HEADERS_ARTIFACT_NAME: string;
  RESPONSE_HEADERS_NAME: string;
  COGNITO_DOMAIN_NAME_OUTPUT_KEY: string;
  COGNITO_DOMAIN_NAME: string;
  USE_CLOUD_FRONT: boolean;
  VPC_ID: string;
  ECS_SUBNET_IDS: string[];
  ECS_AZS: string[];
  ECR_REPOSITORY_NAME: string;
} {
  const config = getAPIOutputs();
  const STAGE = process.env.STAGE || '';
  const namePrefix = `swb-ui-${process.env.STAGE}-${config.awsRegionShortName}`;
  const ACCOUNT_ID = config.accountId;
  const API_BASE_URL = config.apiUrlOutput?.replace('/dev/', '') || '';
  const AWS_REGION = config.awsRegion;
  const COGNITO_DOMAIN_NAME_OUTPUT_KEY = 'CognitoURL';
  const COGNITO_DOMAIN_NAME = config.cognitoDomainName;
  const STACK_NAME = namePrefix;
  const S3_ARTIFACT_BUCKET_NAME = `${namePrefix}-bucket`;
  const S3_ARTIFACT_BUCKET_DEPLOYMENT_NAME = `${namePrefix}-deployment-bucket`;
  const ACCESS_IDENTITY_ARTIFACT_NAME = `${namePrefix}-origin-access-identity`;
  const DISTRIBUTION_ARTIFACT_NAME = `${namePrefix}-distribution`;
  const DISTRIBUTION_ARTIFACT_DOMAIN = 'WebsiteURL';
  const DISTRIBUTION_FUNCTION_ARTIFACT_NAME = `${namePrefix}-redirect-distribution-function`;
  const DISTRIBUTION_FUNCTION_NAME = `${namePrefix}-RedirectRoutingFunction`;
  const RESPONSE_HEADERS_ARTIFACT_NAME = `${namePrefix}-response-header-policy`;
  const RESPONSE_HEADERS_NAME = `${namePrefix}-SWBResponseHeadersPolicy`;
  const S3_ACCESS_LOGS_BUCKET_PREFIX = 'service-workbench-access-log';
  const MAIN_ACCT_ALB_LISTENER_ARN = config.mainAccountAlbListenerArn;
  const USE_CLOUD_FRONT = config.useCloudFront;
  const VPC_ID = config.vpcId;
  const ECS_SUBNET_IDS = config.ecsSubnetIds;
  const ECS_AZS = config.ecsAzs;
  const SWB_DOMAIN_NAME = config.swbDomainName;
  const ECR_REPOSITORY_NAME = config.ecrRepositoryName;

  // CloudFormation Output Keys
  const S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY = 'S3BucketArtifactsArnOutput';
  // The output name below must match the value in swb-reference
  const S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY = `${STAGE}-S3BucketAccessLogsNameOutput`;

  return {
    STAGE,
    ACCOUNT_ID,
    API_BASE_URL,
    AWS_REGION,
    STACK_NAME,
    S3_ACCESS_LOGS_BUCKET_PREFIX,
    S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY,
    SWB_DOMAIN_NAME,
    MAIN_ACCT_ALB_LISTENER_ARN,
    S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY,
    S3_ARTIFACT_BUCKET_NAME,
    S3_ARTIFACT_BUCKET_DEPLOYMENT_NAME,
    ACCESS_IDENTITY_ARTIFACT_NAME,
    DISTRIBUTION_ARTIFACT_NAME,
    DISTRIBUTION_ARTIFACT_DOMAIN,
    DISTRIBUTION_FUNCTION_ARTIFACT_NAME,
    DISTRIBUTION_FUNCTION_NAME,
    RESPONSE_HEADERS_ARTIFACT_NAME,
    RESPONSE_HEADERS_NAME,
    COGNITO_DOMAIN_NAME_OUTPUT_KEY,
    COGNITO_DOMAIN_NAME,
    USE_CLOUD_FRONT,
    VPC_ID,
    ECS_SUBNET_IDS,
    ECS_AZS,
    ECR_REPOSITORY_NAME
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAPIOutputs(): {
  accountId: string;
  awsRegionShortName: string;
  apiUrlOutput: string;
  awsRegion: string;
  cognitoDomainName: string;
  swbDomainName: string;
  mainAccountAlbListenerArn: string;
  useCloudFront: boolean;
  vpcId: string;
  ecsSubnetIds: string[];
  ecsAzs: string[];
  ecrRepositoryName: string;
} {
  try {
    if (process.env.aws_account_number && process.env.SYNTH_REGION_SHORTNAME && process.env.SYNTH_REGION)
      //allow environment variable override for synth pipeline check
      return {
        accountId: '',
        awsRegionShortName: process.env.SYNTH_REGION_SHORTNAME,
        apiUrlOutput: '',
        awsRegion: process.env.SYNTH_REGION,
        cognitoDomainName: '',
        swbDomainName: '',
        mainAccountAlbListenerArn: '',
        useCloudFront: false,
        vpcId: '',
        ecsSubnetIds: [],
        ecsAzs: [],
        ecrRepositoryName: ''
      };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiStackOutputs: any = JSON.parse(
      // __dirname is a variable that reference the current directory. We use it so we can dynamically navigate to the
      // correct file
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFileSync(join(__dirname, `../../../swb-reference/src/config/${process.env.STAGE}.json`), 'utf8') // nosemgrep
    );
    const apiStackName = Object.entries(apiStackOutputs).map(([key, value]) => key)[0]; //output has a format { stackname: {...props} }
    // eslint-disable-next-line security/detect-object-injection
    const outputs = apiStackOutputs[apiStackName];
    const useCloudFront = outputs.useCloudFront === 'true';
    let ecrRepositoryName = '';
    let mainAccountAlbListenerArn = '';
    let swbDomainName = '';
    let vpcId = '';
    let ecsSubnetIds = [];
    let ecsAzs = [];
    if (!useCloudFront) {
      ecrRepositoryName = outputs.SwbEcrRepositoryNameOutput;
      swbDomainName = outputs.SwbDomainNameOutput;
      mainAccountAlbListenerArn = outputs.MainAccountLoadBalancerListenerArnOutput;
      vpcId = outputs.SwbVpcIdOutput;
      ecsSubnetIds = outputs.SwbEcsSubnetIdsOutput.split(',');
      ecsAzs = outputs.SwbEcsAzsOutput.split(',');
    }

    if (!outputs.awsRegionShortName || !outputs.apiUrlOutput || !outputs.awsRegion) {
      throw new Error(
        `Configuration file for ${process.env.STAGE} was found with incorrect format. Please deploy application swb-reference and try again.`
      ); //validate when API unsuccessfully finished and UI is deployed
    }

    return {
      accountId: outputs.accountId,
      awsRegionShortName: outputs.awsRegionShortName,
      apiUrlOutput: outputs.apiUrlOutput,
      awsRegion: outputs.awsRegion,
      cognitoDomainName: outputs.cognitoDomainName,
      swbDomainName: swbDomainName,
      mainAccountAlbListenerArn: mainAccountAlbListenerArn,
      useCloudFront: useCloudFront,
      vpcId: vpcId,
      ecsSubnetIds: ecsSubnetIds,
      ecsAzs: ecsAzs,
      ecrRepositoryName: ecrRepositoryName
    };
  } catch {
    console.error(
      `No API Stack deployed found for ${process.env.STAGE}.Please deploy application swb-reference and try again.`
    );
    throw new Error(`No API Stack deployed found for ${process.env.STAGE}.`);
  }
}

export { getConstants };
